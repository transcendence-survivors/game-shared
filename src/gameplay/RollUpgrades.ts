import type { Player } from '../schemas/GameState';
import { weaponConfigRegistry } from '../combat/WeaponConfigRegistry';
import { COMBAT_LIMITS } from '../combat/WeaponConfigs';
import { UPGRADE_RARITIES, WEAPON_KINDS } from '../utils/Constants';
import type { UpgradeRarity, WeaponKind } from '../utils/Types';
import {
	formatTomeValue,
	formatWeaponBonus,
	RARITY_CONFIG,
	TOME_DEFINITIONS,
	TOME_SLOT_LIMIT,
	WEAPON_ICONS,
	WEAPON_NAMES,
	WEAPON_TRAIT_POOLS,
	type TomeDefinition,
	type UpgradeDef,
	type WeaponUpgradeBonus,
} from '../utils/Upgrades';
import { WeaponState } from '../schemas/GameState';

type UpgradeCandidate =
	| { kind: 'tome'; definition: TomeDefinition }
	| { kind: 'unlock'; weaponKind: WeaponKind }
	| { kind: 'weapon'; weaponKind: WeaponKind };

function roundBonus(value: number): number {
	return Math.round(value * 1000) / 1000;
}

function offerId(prefix: string, random: () => number): string {
	return `${prefix}:${Math.floor(random() * 0xffffffff).toString(36)}`;
}

function shuffleInPlace<T>(values: T[], random: () => number): T[] {
	for (let index = values.length - 1; index > 0; index--) {
		const target = Math.floor(random() * (index + 1));
		[values[index], values[target]] = [values[target], values[index]];
	}
	return values;
}

export function rollUpgradeRarity(
	luck: number,
	random: () => number,
): UpgradeRarity {
	const safeLuck = Number.isFinite(luck) ? Math.max(1, luck) : 1;
	let total = 0;
	for (const rarity of UPGRADE_RARITIES) {
		const base = RARITY_CONFIG[rarity].weight;
		total += rarity === 'common' ? base : base * safeLuck;
	}
	let roll = random() * total;
	for (const rarity of UPGRADE_RARITIES) {
		const base = RARITY_CONFIG[rarity].weight;
		roll -= rarity === 'common' ? base : base * safeLuck;
		if (roll <= 0) return rarity;
	}
	return 'legendary';
}

function tomeValue(definition: TomeDefinition, rarity: UpgradeRarity): number {
	const raw = definition.baseValue * RARITY_CONFIG[rarity].valueMultiplier;
	if (
		definition.stat === 'armor' ||
		definition.stat === 'quantity' ||
		definition.stat === 'penetration'
	)
		return Math.max(1, Math.round(raw));
	return roundBonus(raw);
}

function rollTome(
	player: Player,
	definition: TomeDefinition,
	random: () => number,
): UpgradeDef {
	const rarity = rollUpgradeRarity(player.stats.luck, random);
	const value = tomeValue(definition, rarity);
	const level = (player.stats.tomeLevels.get(definition.id) ?? 0) + 1;
	return {
		id: offerId(`tome_${definition.id}`, random),
		name: `${definition.name} · Niv. ${level}`,
		description: formatTomeValue(definition, value),
		iconUrl: definition.iconUrl,
		rarity,
		category: 'tome',
		effect: {
			kind: 'tome',
			tomeId: definition.id,
			stat: definition.stat,
			value,
			maxLevel: definition.maxLevel,
		},
	};
}

function rolledWeaponBonuses(
	weaponKind: WeaponKind,
	rarity: UpgradeRarity,
	random: () => number,
): { values: WeaponUpgradeBonus[]; description: string } {
	const pool = shuffleInPlace([...WEAPON_TRAIT_POOLS[weaponKind]], random);
	const { valueMultiplier, weaponStatCount } = RARITY_CONFIG[rarity];
	const values: WeaponUpgradeBonus[] = [];
	let description = '';
	const count = Math.min(pool.length, weaponStatCount);
	for (let index = 0; index < count; index++) {
		const definition = pool[index]!;
		const value =
			definition.format === 'integer'
				? Math.max(
						1,
						Math.round(definition.baseValue * valueMultiplier),
					)
				: roundBonus(definition.baseValue * valueMultiplier);
		values.push({ stat: definition.stat, value });
		description += `${description ? '\n' : ''}${formatWeaponBonus(definition, value)}`;
	}
	return { values, description };
}

function rollWeaponAugment(
	player: Player,
	weaponKind: WeaponKind,
	random: () => number,
): UpgradeDef {
	const rarity = rollUpgradeRarity(player.stats.luck, random);
	const { values, description } = rolledWeaponBonuses(
		weaponKind,
		rarity,
		random,
	);
	const nextLevel = (player.weapons.get(weaponKind)?.level ?? 0) + 1;
	return {
		id: offerId(`weapon_${weaponKind}`, random),
		name: `${WEAPON_NAMES[weaponKind]} · Niv. ${nextLevel}`,
		description,
		iconUrl: WEAPON_ICONS[weaponKind],
		rarity,
		category: 'weapon',
		effect: {
			kind: 'augment-weapon',
			weaponKind,
			bonuses: values,
			maxLevel: weaponConfigRegistry.get(weaponKind).maxLevel,
		},
	};
}

function unlockWeapon(
	weaponKind: WeaponKind,
	random: () => number,
): UpgradeDef {
	return {
		id: offerId(`unlock_${weaponKind}`, random),
		name: `Débloquer ${WEAPON_NAMES[weaponKind]}`,
		description: 'Nouvelle arme ajoutée à votre arsenal',
		iconUrl: WEAPON_ICONS[weaponKind],
		rarity: 'common',
		category: 'unlock',
		effect: { kind: 'unlock-weapon', weaponKind },
	};
}

export function canApplyUpgrade(player: Player, upgrade: UpgradeDef): boolean {
	const effect = upgrade.effect;
	if (effect.kind === 'tome') {
		const current = player.stats.tomeLevels.get(effect.tomeId) ?? 0;
		return (
			current < effect.maxLevel &&
			(current > 0 || player.stats.tomeLevels.size < TOME_SLOT_LIMIT)
		);
	}
	const weapon = player.weapons.get(effect.weaponKind);
	if (effect.kind === 'unlock-weapon')
		return (
			!weapon && player.weapons.size < COMBAT_LIMITS.maxWeaponsPerPlayer
		);
	return !!weapon && weapon.level < effect.maxLevel;
}

export function applyUpgrade(player: Player, upgrade: UpgradeDef): boolean {
	if (!canApplyUpgrade(player, upgrade)) return false;
	const effect = upgrade.effect;
	if (effect.kind === 'unlock-weapon') {
		const state = new WeaponState();
		state.kind = effect.weaponKind;
		player.weapons.set(effect.weaponKind, state);
		return true;
	}
	if (effect.kind === 'augment-weapon') {
		const weapon = player.weapons.get(effect.weaponKind)!;
		for (const bonus of effect.bonuses) weapon[bonus.stat] += bonus.value;
		weapon.level++;
		return true;
	}
	player.stats[effect.stat] += effect.value;
	player.stats.tomeLevels.set(
		effect.tomeId,
		(player.stats.tomeLevels.get(effect.tomeId) ?? 0) + 1,
	);
	if (effect.stat === 'maxHealth')
		player.life.rescale(player.stats.maxHealth);
	return true;
}

function candidatesFor(player: Player): UpgradeCandidate[] {
	const candidates: UpgradeCandidate[] = [];
	const hasFreeTomeSlot = player.stats.tomeLevels.size < TOME_SLOT_LIMIT;
	for (const definition of TOME_DEFINITIONS) {
		const level = player.stats.tomeLevels.get(definition.id) ?? 0;
		if (level < definition.maxLevel && (level > 0 || hasFreeTomeSlot))
			candidates.push({ kind: 'tome', definition });
	}
	for (const weaponKind of WEAPON_KINDS) {
		const weapon = player.weapons.get(weaponKind);
		if (!weapon) {
			if (player.weapons.size < COMBAT_LIMITS.maxWeaponsPerPlayer)
				candidates.push({ kind: 'unlock', weaponKind });
		} else if (
			weapon.level < weaponConfigRegistry.get(weaponKind).maxLevel
		) {
			candidates.push({ kind: 'weapon', weaponKind });
		}
	}
	return candidates;
}

export function rollUpgradeOptions(
	player: Player,
	count: number = 3,
	random: () => number = Math.random,
): UpgradeDef[] {
	const candidates = shuffleInPlace(candidatesFor(player), random);
	return candidates.slice(0, Math.max(0, count)).map((candidate) => {
		switch (candidate.kind) {
			case 'tome':
				return rollTome(player, candidate.definition, random);
			case 'unlock':
				return unlockWeapon(candidate.weaponKind, random);
			case 'weapon':
				return rollWeaponAugment(player, candidate.weaponKind, random);
		}
	});
}

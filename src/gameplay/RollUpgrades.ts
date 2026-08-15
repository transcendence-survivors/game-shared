import { WeaponState, type Player } from '../schemas/GameState';
import { weaponConfigRegistry } from '../combat/WeaponConfigRegistry';
import { WEAPON_KINDS } from '../utils/Constants';
import {
	UPGRADE_POOL,
	weaponUpgradeDefinitions,
	type UpgradeDef,
} from '../utils/Upgrades';

export function canApplyUpgrade(player: Player, upgrade: UpgradeDef): boolean {
	const effect = upgrade.effect;
	if (effect.kind === 'global-stat')
		return (
			(player.stats.upgradeStacks.get(upgrade.id) ?? 0) < effect.maxStacks
		);
	const weapon = player.weapons.get(effect.weaponKind);
	if (effect.kind === 'unlock-weapon') return !weapon;
	return (
		!!weapon &&
		weapon.level < weaponConfigRegistry.get(effect.weaponKind).maxLevel
	);
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
	if (effect.kind === 'level-weapon') {
		player.weapons.get(effect.weaponKind)!.level++;
		return true;
	}
	const current = player.stats[effect.stat];
	player.stats[effect.stat] =
		effect.operation === 'add'
			? current + effect.value
			: current * effect.value;
	player.stats.upgradeStacks.set(
		upgrade.id,
		(player.stats.upgradeStacks.get(upgrade.id) ?? 0) + 1,
	);
	if (effect.stat === 'maxHealth')
		player.life.rescale(player.stats.maxHealth);
	return true;
}

export function rollUpgradeOptions(
	_player: Player,
	count: number = 3,
	random: () => number = Math.random,
): UpgradeDef[] {
	const weaponOptions = WEAPON_KINDS.map((kind) =>
		weaponUpgradeDefinitions(kind, _player.weapons.has(kind)),
	);
	const pool = [...UPGRADE_POOL, ...weaponOptions].filter((upgrade) =>
		canApplyUpgrade(_player, upgrade),
	);

	for (let i = pool.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[pool[i], pool[j]] = [pool[j], pool[i]];
	}
	return pool.slice(0, count);
}

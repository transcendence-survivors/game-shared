import { describe, expect, test } from 'vitest';
import { Player, WeaponState } from '../schemas/GameState';
import {
	applyUpgrade,
	canApplyUpgrade,
	rollUpgradeOptions,
	rollUpgradeRarity,
} from './RollUpgrades';
import {
	TOME_SLOT_LIMIT,
	toUpgradeOption,
	type UpgradeDef,
} from '../utils/Upgrades';

function playerWithAura(): Player {
	const player = new Player();
	const aura = new WeaponState();
	aura.kind = 'aura';
	player.weapons.set('aura', aura);
	return player;
}

describe('RollUpgrades', () => {
	test('rolls deterministic offers with rarity and exact effects', () => {
		const firstPlayer = playerWithAura();
		const secondPlayer = playerWithAura();
		const first = rollUpgradeOptions(firstPlayer, 3, () => 0.25);
		const second = rollUpgradeOptions(secondPlayer, 3, () => 0.25);
		expect(second).toEqual(first);
		expect(first).toHaveLength(3);
		for (const option of first) {
			expect(option.rarity).toBeTruthy();
			expect(option.category).toBeTruthy();
			expect(option.description.length).toBeGreaterThan(0);
		}
	});

	test('keeps authoritative effects out of public offers', () => {
		const [upgrade] = rollUpgradeOptions(playerWithAura(), 1, () => 0.25);
		const option = toUpgradeOption(upgrade!);

		expect(option).not.toHaveProperty('effect');
		expect(option.id).toBe(upgrade!.id);
	});

	test('unlocks then augments a weapon with rolled attributes', () => {
		const player = playerWithAura();
		const unlock: UpgradeDef = {
			id: 'unlock_bow:test',
			name: 'Débloquer Arc',
			description: 'Nouvelle arme',
			iconUrl: 'weaponBow',
			rarity: 'common',
			category: 'unlock',
			effect: { kind: 'unlock-weapon', weaponKind: 'bow' },
		};
		expect(applyUpgrade(player, unlock)).toBe(true);
		const augment: UpgradeDef = {
			id: 'weapon_bow:test',
			name: 'Arc · Niv. 2',
			description: '+20 % dégâts\n+1 projectile',
			iconUrl: 'weaponBow',
			rarity: 'rare',
			category: 'weapon',
			effect: {
				kind: 'augment-weapon',
				weaponKind: 'bow',
				maxLevel: 40,
				bonuses: [
					{ stat: 'damageBonus', value: 0.2 },
					{ stat: 'quantityBonus', value: 1 },
				],
			},
		};
		expect(applyUpgrade(player, augment)).toBe(true);
		expect(player.weapons.get('bow')).toMatchObject({
			level: 2,
			damageBonus: 0.2,
			quantityBonus: 1,
		});
	});

	test('limits new tomes to slots while allowing selected tomes to level', () => {
		const player = playerWithAura();
		for (let index = 0; index < TOME_SLOT_LIMIT; index++)
			player.stats.tomeLevels.set(`selected-${index}`, 1);
		const newTome: UpgradeDef = {
			id: 'tome_damage:test',
			name: 'Tome de puissance',
			description: '+8 % dégâts',
			iconUrl: 'tomeDamage',
			rarity: 'common',
			category: 'tome',
			effect: {
				kind: 'tome',
				tomeId: 'damage',
				stat: 'attackDamage',
				value: 8,
				maxLevel: 99,
			},
		};
		expect(canApplyUpgrade(player, newTome)).toBe(false);
		if (newTome.effect.kind !== 'tome') throw new Error('Expected tome');
		newTome.effect.tomeId = 'selected-0';
		expect(applyUpgrade(player, newTome)).toBe(true);
		expect(player.stats.attackDamage).toBe(108);
		expect(player.stats.tomeLevels.get('selected-0')).toBe(2);
	});

	test('rejects a fourth weapon at the authoritative loadout limit', () => {
		const player = playerWithAura();
		for (const kind of ['sword', 'axe'] as const) {
			const weapon = new WeaponState();
			weapon.kind = kind;
			player.weapons.set(kind, weapon);
		}
		const fourthWeapon: UpgradeDef = {
			id: 'unlock_bow:forged',
			name: 'Débloquer Arc',
			description: 'Nouvelle arme',
			iconUrl: 'weaponBow',
			rarity: 'common',
			category: 'unlock',
			effect: { kind: 'unlock-weapon', weaponKind: 'bow' },
		};

		expect(player.weapons.size).toBe(3);
		expect(canApplyUpgrade(player, fourthWeapon)).toBe(false);
		expect(applyUpgrade(player, fourthWeapon)).toBe(false);
		expect(player.weapons.has('bow')).toBe(false);
	});

	test('luck increases access to high rarities', () => {
		expect(rollUpgradeRarity(1, () => 0.9)).toBe('rare');
		expect(rollUpgradeRarity(5, () => 0.9)).toBe('epic');
	});
});

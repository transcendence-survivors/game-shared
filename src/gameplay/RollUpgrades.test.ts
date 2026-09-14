import { describe, expect, test } from 'vitest';
import { Player, WeaponState } from '../schemas/GameState';
import {
	applyUpgrade,
	canApplyUpgrade,
	rollUpgradeOptions,
	rollUpgradeRarity,
} from './RollUpgrades';
import { toUpgradeOption, type UpgradeDef } from '../utils/Upgrades';

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
			expect(option.effect).toBeTruthy();
		}
	});

	test('keeps authoritative effects out of public offers', () => {
		const [upgrade] = rollUpgradeOptions(playerWithAura(), 1, () => 0.25);
		const option = toUpgradeOption(upgrade!);

		expect(option).not.toHaveProperty('effect');
		expect(option).not.toHaveProperty('name');
		expect(option).not.toHaveProperty('description');
		expect(option.id).toBe(upgrade!.id);
		expect(option.effects.length).toBeGreaterThan(0);
	});

	test('creates a locale-neutral public payload with display-ready values', () => {
		const option = toUpgradeOption({
			id: 'weapon_bow:test',
			iconUrl: 'weaponBow',
			rarity: 'rare',
			effect: {
				kind: 'augment-weapon',
				weaponKind: 'bow',
				level: 3,
				maxLevel: 40,
				bonuses: [
					{ stat: 'damageBonus', value: 0.2 },
					{ stat: 'quantityBonus', value: 2 },
				],
			},
		});

		expect(option).toEqual({
			id: 'weapon_bow:test',
			iconUrl: 'weaponBow',
			rarity: 'rare',
			category: 'weapon',
			weaponKind: 'bow',
			level: 3,
			effects: [
				{
					source: 'weapon',
					stat: 'damageBonus',
					value: 20,
					format: 'percent',
				},
				{
					source: 'weapon',
					stat: 'quantityBonus',
					value: 2,
					format: 'integer',
				},
			],
		});
	});

	test('unlocks then augments a weapon with rolled attributes', () => {
		const player = playerWithAura();
		const unlock: UpgradeDef = {
			id: 'unlock_bow:test',
			iconUrl: 'weaponBow',
			rarity: 'common',
			effect: { kind: 'unlock-weapon', weaponKind: 'bow' },
		};
		expect(applyUpgrade(player, unlock)).toBe(true);
		const augment: UpgradeDef = {
			id: 'weapon_bow:test',
			iconUrl: 'weaponBow',
			rarity: 'rare',
			effect: {
				kind: 'augment-weapon',
				weaponKind: 'bow',
				level: 2,
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
		for (const tomeId of [
			'cooldown',
			'agility',
			'vitality',
			'armor',
		] as const)
			player.stats.tomeLevels.set(tomeId, 1);
		const newTome: UpgradeDef = {
			id: 'tome_damage:test',
			iconUrl: 'tomeDamage',
			rarity: 'common',
			effect: {
				kind: 'tome',
				tomeId: 'damage',
				stat: 'attackDamage',
				value: 8,
				level: 1,
				maxLevel: 99,
			},
		};
		expect(canApplyUpgrade(player, newTome)).toBe(false);
		if (newTome.effect.kind !== 'tome') throw new Error('Expected tome');
		newTome.effect.tomeId = 'cooldown';
		expect(applyUpgrade(player, newTome)).toBe(true);
		expect(player.stats.attackDamage).toBe(108);
		expect(player.stats.tomeLevels.get('cooldown')).toBe(2);
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
			iconUrl: 'weaponBow',
			rarity: 'common',
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

import { describe, expect, test } from 'vitest';
import { Player, WeaponState } from '../schemas/GameState';
import {
	applyUpgrade,
	canApplyUpgrade,
	rollUpgradeOptions,
} from './RollUpgrades';
import { UPGRADE_POOL, weaponUpgradeDefinitions } from '../utils/Upgrades';

function playerWithAura(): Player {
	const player = new Player();
	const aura = new WeaponState();
	aura.kind = 'aura';
	player.weapons.set('aura', aura);
	return player;
}

describe('RollUpgrades', () => {
	test('is deterministic and does not reorder the global pool', () => {
		const player = playerWithAura();
		const originalIds = UPGRADE_POOL.map(({ id }) => id);
		const random = () => 0.25;
		const first = rollUpgradeOptions(player, 3, random).map(({ id }) => id);
		const second = rollUpgradeOptions(player, 3, random).map(
			({ id }) => id,
		);
		expect(second).toEqual(first);
		expect(UPGRADE_POOL.map(({ id }) => id)).toEqual(originalIds);
	});

	test('unlocks and levels a weapon without exceeding its cap', () => {
		const player = playerWithAura();
		const unlock = weaponUpgradeDefinitions('bow', false);
		expect(applyUpgrade(player, unlock)).toBe(true);
		expect(player.weapons.get('bow')?.level).toBe(1);
		const level = weaponUpgradeDefinitions('bow', true);
		for (let index = 0; index < 4; index++)
			expect(applyUpgrade(player, level)).toBe(true);
		expect(canApplyUpgrade(player, level)).toBe(false);
		expect(applyUpgrade(player, level)).toBe(false);
	});

	test('applies lifesteal as percentage points and filters capped upgrades', () => {
		const player = playerWithAura();
		const lifesteal = UPGRADE_POOL.find(({ id }) => id === 'lifesteal_up')!;
		expect(applyUpgrade(player, lifesteal)).toBe(true);
		expect(player.stats.lifesteal).toBe(3);
		for (let index = 1; index < 10; index++)
			applyUpgrade(player, lifesteal);
		expect(canApplyUpgrade(player, lifesteal)).toBe(false);
		expect(
			rollUpgradeOptions(player, 20, () => 0).some(
				({ id }) => id === lifesteal.id,
			),
		).toBe(false);
	});
});

import { describe, expect, it } from 'vitest';
import type { WeaponConfig } from './WeaponConfig';
import { WeaponConfigRegistry } from './WeaponConfigRegistry';
import { COMBAT_LIMITS, WEAPON_CONFIGS } from './WeaponConfigs';

function cloneConfigs(): WeaponConfig[] {
	return WEAPON_CONFIGS.map((config) => ({
		...config,
		...(config.kind === 'bow'
			? { spreadAnglesDegrees: [...config.spreadAnglesDegrees] }
			: {}),
	})) as WeaponConfig[];
}

describe('WeaponConfigRegistry', () => {
	it('loads every weapon configuration', () => {
		const registry = new WeaponConfigRegistry();
		expect(registry.all().map((config) => config.kind)).toEqual([
			'aura',
			'sword',
			'axe',
			'staff',
			'bow',
		]);
		expect(registry.get('bow').projectileCount).toBe(3);
		expect(registry.get('sword').totalAngleDegrees).toBe(180);
	});

	it('freezes configurations and limits', () => {
		const registry = new WeaponConfigRegistry();
		expect(Object.isFrozen(registry.get('aura'))).toBe(true);
		expect(Object.isFrozen(registry.limits)).toBe(true);
	});

	it('rejects duplicate and missing configurations', () => {
		const configs = cloneConfigs();
		expect(
			() => new WeaponConfigRegistry([...configs, configs[0]]),
		).toThrow('Duplicate weapon config');
		expect(() => new WeaponConfigRegistry(configs.slice(1))).toThrow(
			'Missing weapon config: aura',
		);
	});

	it('rejects invalid specialized values', () => {
		const configs = cloneConfigs();
		const sword = configs.find((config) => config.kind === 'sword');
		if (!sword || sword.kind !== 'sword') throw new Error('Missing sword');
		sword.totalAngleDegrees = 361;
		expect(() => new WeaponConfigRegistry(configs)).toThrow(
			'sword.totalAngleDegrees cannot exceed 360',
		);
	});

	it('rejects combat limits that are not positive integers', () => {
		expect(
			() =>
				new WeaponConfigRegistry(WEAPON_CONFIGS, {
					...COMBAT_LIMITS,
					maxCombatEntitiesPerRoom: 0,
				}),
		).toThrow('combatLimits.maxCombatEntitiesPerRoom');
	});
});

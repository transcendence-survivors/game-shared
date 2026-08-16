import { describe, expect, test } from 'vitest';
import { BOSS_KINDS, MONSTER_KINDS } from '../utils/Constants';
import {
	BOSS_MODEL_SCALE,
	DEFAULT_MONSTER_HITBOX_RADIUS,
	MONSTER_HITBOX_PROFILES,
	getMonsterCompoundHitboxes,
	getMonsterHitboxRadius,
} from './MonsterHitboxes';

describe('monster hitboxes', () => {
	test('defines a positive model radius for every monster and boss', () => {
		for (const kind of [...MONSTER_KINDS, ...BOSS_KINDS]) {
			const profile = MONSTER_HITBOX_PROFILES[kind];
			expect(profile.bounds[0]).toBeGreaterThan(0);
			expect(profile.bounds[2]).toBeTypeOf('number');
			expect(profile.bounds[4]).toBeTypeOf('number');
			expect(profile.parts).toHaveLength(3);
			for (const part of profile.parts) {
				expect(part.shape).toBe('cylinder');
				expect(part.radius).toBeGreaterThan(0);
				expect(part.height).toBeGreaterThan(0);
			}
		}
	});

	test('poses lower body, torso and head deterministically by animation state', () => {
		const idle = getMonsterCompoundHitboxes('grunt', false, 'idle', 0.25);
		const walk = getMonsterCompoundHitboxes('grunt', false, 'walk', 0.25);
		const attack = getMonsterCompoundHitboxes(
			'grunt',
			false,
			'attack',
			0.25,
		);
		expect(idle.map((part) => part.role)).toEqual([
			'lower',
			'torso',
			'head',
		]);
		expect(walk[1].offsetX).not.toBe(idle[1].offsetX);
		expect(attack[2].offsetZ).toBeGreaterThan(idle[2].offsetZ);
		expect(
			getMonsterCompoundHitboxes('grunt', false, 'walk', 0.25),
		).toEqual(walk);
	});

	test('applies the visual boss scale and keeps a safe fallback', () => {
		expect(getMonsterHitboxRadius('grunt', false)).toBe(
			MONSTER_HITBOX_PROFILES.grunt.bounds[0],
		);
		expect(getMonsterHitboxRadius('gorvath', true)).toBeCloseTo(
			MONSTER_HITBOX_PROFILES.gorvath.bounds[0] * BOSS_MODEL_SCALE,
		);
		expect(getMonsterHitboxRadius('unknown', false)).toBe(
			DEFAULT_MONSTER_HITBOX_RADIUS,
		);
	});
});

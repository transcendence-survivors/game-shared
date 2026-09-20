import { describe, expect, test } from 'vitest';
import {
	advanceReviveProgress,
	canRevive,
	isWithinReviveRange,
	reviveHealthFor,
} from './Revive';
import { Life } from '../schemas/Life';
import { PLAYER_REVIVE_RADIUS, REVIVE_DURATION_S } from '../utils/Constants';

const player = (isDowned: boolean, current: number, max = 100) => {
	const life = new Life(max);
	life.current = current;
	return { isDowned, life };
};

describe('canRevive', () => {
	test('only a standing player with life left can revive', () => {
		expect(canRevive(player(false, 40))).toBe(true);
		expect(canRevive(player(true, 0))).toBe(false);
		expect(canRevive(player(false, 0))).toBe(false);
	});
});

describe('isWithinReviveRange', () => {
	test('accepts an ally inside the radius', () => {
		expect(isWithinReviveRange({ x: 0, z: 0 }, { x: 3, z: 4 }, 5)).toBe(
			true,
		);
	});

	test('rejects an ally past the radius', () => {
		expect(isWithinReviveRange({ x: 0, z: 0 }, { x: 3, z: 4 }, 4.9)).toBe(
			false,
		);
	});

	test('ignores height and defaults to the shared radius', () => {
		const justInside = PLAYER_REVIVE_RADIUS - 0.01;
		expect(
			isWithinReviveRange({ x: 0, z: 0 }, { x: justInside, z: 0 }),
		).toBe(true);
		expect(
			isWithinReviveRange({ x: 0, z: 0 }, { x: PLAYER_REVIVE_RADIUS + 1, z: 0 }),
		).toBe(false);
	});
});

describe('advanceReviveProgress', () => {
	test('fills over the configured duration', () => {
		expect(advanceReviveProgress(0, REVIVE_DURATION_S / 2)).toBeCloseTo(
			0.5,
		);
	});

	test('clamps at one', () => {
		expect(advanceReviveProgress(0.9, REVIVE_DURATION_S)).toBe(1);
	});

	test('ignores non-positive or invalid deltas', () => {
		expect(advanceReviveProgress(0.4, 0)).toBe(0.4);
		expect(advanceReviveProgress(0.4, Number.NaN)).toBe(0.4);
	});

	test('treats an invalid progress as zero', () => {
		expect(advanceReviveProgress(Number.NaN, REVIVE_DURATION_S)).toBe(1);
		expect(advanceReviveProgress(-1, REVIVE_DURATION_S / 4)).toBeCloseTo(
			0.25,
		);
	});
});

describe('reviveHealthFor', () => {
	test('returns half of the maximum life', () => {
		expect(reviveHealthFor(player(true, 0, 240))).toBe(120);
	});
});

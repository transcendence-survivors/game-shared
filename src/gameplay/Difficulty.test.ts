import { describe, expect, it } from 'vitest';
import {
	computeMonsterStats,
	difficultyFactor,
	pickDistinct,
	splitStatBudget,
	targetPopulation,
} from './Difficulty';
import {
	BOSS_STAT_SCALE,
	DIFFICULTY_GROWTH_PER_MINUTE,
	MIN_STAT_MULTIPLIER,
	MONSTER_BASE_DAMAGE,
	MONSTER_BASE_LIFE,
	MONSTER_BASE_POPULATION,
	MONSTER_BASE_XP_REWARD,
	MONSTER_MAX_POPULATION,
	STAT_BUDGET,
} from '../utils/Constants';

describe('difficultyFactor', () => {
	it('starts at 1 and never goes below', () => {
		expect(difficultyFactor(0)).toBe(1);
		expect(difficultyFactor(-30)).toBe(1);
	});

	it('grows linearly with elapsed minutes', () => {
		expect(difficultyFactor(60)).toBe(1 + DIFFICULTY_GROWTH_PER_MINUTE);
		expect(difficultyFactor(120)).toBe(
			1 + 2 * DIFFICULTY_GROWTH_PER_MINUTE,
		);
	});
});

describe('splitStatBudget', () => {
	it('always distributes the whole budget', () => {
		for (const roll of [0, 0.25, 0.5, 0.75, 0.9999]) {
			const { hpMultiplier, damageMultiplier } = splitStatBudget(roll);
			expect(hpMultiplier + damageMultiplier).toBeCloseTo(STAT_BUDGET);
		}
	});

	it('guarantees a minimum share to each multiplier', () => {
		for (const roll of [0, 1]) {
			const { hpMultiplier, damageMultiplier } = splitStatBudget(roll);
			expect(hpMultiplier).toBeGreaterThanOrEqual(MIN_STAT_MULTIPLIER);
			expect(damageMultiplier).toBeGreaterThanOrEqual(
				MIN_STAT_MULTIPLIER,
			);
		}
	});

	it('clamps out-of-range rolls', () => {
		expect(splitStatBudget(-1)).toEqual(splitStatBudget(0));
		expect(splitStatBudget(2)).toEqual(splitStatBudget(1));
	});
});

describe('computeMonsterStats', () => {
	const even = { hpMultiplier: 1, damageMultiplier: 1 };

	it('returns base stats at game start with neutral multipliers', () => {
		expect(computeMonsterStats(0, even, false)).toEqual({
			maxLife: MONSTER_BASE_LIFE,
			damage: MONSTER_BASE_DAMAGE,
			xpReward: MONSTER_BASE_XP_REWARD,
		});
	});

	it('scales everything with the difficulty curve', () => {
		const factor = difficultyFactor(120);
		expect(computeMonsterStats(120, even, false)).toEqual({
			maxLife: Math.round(MONSTER_BASE_LIFE * factor),
			damage: Math.round(MONSTER_BASE_DAMAGE * factor),
			xpReward: Math.round(MONSTER_BASE_XP_REWARD * factor),
		});
	});

	it('applies the HP/damage multipliers on top of the curve', () => {
		const multipliers = { hpMultiplier: 4, damageMultiplier: 1 };
		const stats = computeMonsterStats(0, multipliers, false);
		expect(stats.maxLife).toBe(MONSTER_BASE_LIFE * 4);
		expect(stats.damage).toBe(MONSTER_BASE_DAMAGE);
		expect(stats.xpReward).toBe(MONSTER_BASE_XP_REWARD);
	});

	it('multiplies boss results by the boss scale', () => {
		// 120s → integer difficulty factor, so rounding stays neutral.
		const regular = computeMonsterStats(120, even, false);
		const boss = computeMonsterStats(120, even, true);
		expect(boss.maxLife).toBe(regular.maxLife * BOSS_STAT_SCALE);
		expect(boss.damage).toBe(regular.damage * BOSS_STAT_SCALE);
		expect(boss.xpReward).toBe(regular.xpReward * BOSS_STAT_SCALE);
	});
});

describe('targetPopulation', () => {
	it('starts small', () => {
		expect(targetPopulation(0)).toBe(MONSTER_BASE_POPULATION);
	});

	it('grows with elapsed time', () => {
		expect(targetPopulation(300)).toBeGreaterThan(targetPopulation(60));
	});

	it('is capped', () => {
		expect(targetPopulation(1e9)).toBe(MONSTER_MAX_POPULATION);
	});
});

describe('pickDistinct', () => {
	const pool = ['a', 'b', 'c', 'd', 'e'] as const;

	it('returns the requested amount of distinct elements from the pool', () => {
		let calls = 0;
		const rolls = [0.9, 0.1, 0.5];
		const picked = pickDistinct(pool, 3, () => rolls[calls++]);
		expect(picked).toHaveLength(3);
		expect(new Set(picked).size).toBe(3);
		picked.forEach((element) => expect(pool).toContain(element));
	});

	it('does not mutate the pool and tolerates oversized counts', () => {
		const source = [1, 2, 3];
		const picked = pickDistinct(source, 10, () => 0.5);
		expect(source).toEqual([1, 2, 3]);
		expect(picked).toHaveLength(3);
		expect(new Set(picked).size).toBe(3);
	});
});

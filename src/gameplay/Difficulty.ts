import type { MonsterStats, StatMultipliers } from '../utils/Types';
import {
	BOSS_STAT_SCALE,
	DIFFICULTY_GROWTH_PER_MINUTE,
	MIN_STAT_MULTIPLIER,
	MONSTER_BASE_DAMAGE,
	MONSTER_BASE_LIFE,
	MONSTER_BASE_XP_REWARD,
	MONSTER_BASE_POPULATION,
	MONSTER_MAX_POPULATION,
	MONSTER_POPULATION_PER_MINUTE,
	STAT_BUDGET,
} from '../utils/Constants';

/**
 * Difficulty curve: starts at 1 and grows linearly with elapsed time,
 * by DIFFICULTY_GROWTH_PER_MINUTE per minute.
 */
export function difficultyFactor(elapsedSeconds: number): number {
	const elapsed = Math.max(0, elapsedSeconds);
	return 1 + DIFFICULTY_GROWTH_PER_MINUTE * (elapsed / 60);
}

/**
 * Splits the STAT_BUDGET (500%) between the HP and damage multipliers.
 * `roll` is a random number in [0, 1); each multiplier is guaranteed at
 * least MIN_STAT_MULTIPLIER so no monster spawns with degenerate stats.
 */
export function splitStatBudget(roll: number): StatMultipliers {
	const clamped = Math.min(Math.max(roll, 0), 1);
	const spread = STAT_BUDGET - 2 * MIN_STAT_MULTIPLIER;
	const hpMultiplier = MIN_STAT_MULTIPLIER + clamped * spread;
	return { hpMultiplier, damageMultiplier: STAT_BUDGET - hpMultiplier };
}

/**
 * Stats of a monster at a given point in time: base stats scaled by the
 * difficulty curve, then by the HP/damage multipliers, then by
 * BOSS_STAT_SCALE for bosses. XP only follows the curve and the boss scale.
 */
export function computeMonsterStats(
	elapsedSeconds: number,
	multipliers: StatMultipliers,
	isBoss: boolean,
): MonsterStats {
	const factor = difficultyFactor(elapsedSeconds);
	const scale = isBoss ? BOSS_STAT_SCALE : 1;
	return {
		maxLife: Math.round(
			MONSTER_BASE_LIFE * factor * multipliers.hpMultiplier * scale,
		),
		damage: Math.round(
			MONSTER_BASE_DAMAGE * factor * multipliers.damageMultiplier * scale,
		),
		xpReward: Math.round(MONSTER_BASE_XP_REWARD * factor * scale),
	};
}

/**
 * How many regular monsters should be alive at a given point in time:
 * few at the start, growing with elapsed minutes, capped to protect the
 * server and the clients.
 */
export function targetPopulation(elapsedSeconds: number): number {
	const elapsed = Math.max(0, elapsedSeconds);
	const grown =
		MONSTER_BASE_POPULATION +
		Math.floor(MONSTER_POPULATION_PER_MINUTE * (elapsed / 60));
	return Math.min(MONSTER_MAX_POPULATION, grown);
}

/**
 * Draws `count` distinct elements from `pool` using the provided random
 * source (partial Fisher-Yates, does not mutate the pool).
 */
export function pickDistinct<T>(
	pool: readonly T[],
	count: number,
	random: () => number,
): T[] {
	const copy = [...pool];
	const picked = Math.min(count, copy.length);
	for (let i = 0; i < picked; i++) {
		const j = i + Math.floor(random() * (copy.length - i));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy.slice(0, picked);
}

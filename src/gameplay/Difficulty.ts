import type { MonsterRank, MonsterRuntimeStats } from '../utils/Types';
import {
	CHUNK_DISPLAY_RADIUS,
	MONSTER_BASE_DAMAGE,
	MONSTER_BASE_LIFE,
	MONSTER_BASE_XP_REWARD,
	MONSTER_ATTACK_COOLDOWN_S,
	MONSTER_ATTACK_RANGE,
	MONSTER_BASE_POPULATION,
	MONSTER_BOSS_SLOT_CAPACITY,
	MONSTER_MOVE_SPEED,
	MONSTER_MAX_POPULATION,
} from '../utils/Constants';
import { getMonsterDefinition } from './MonsterCatalog';

export interface DifficultyStage {
	startTimeS: number;
	healthMultiplier: number;
	damageMultiplier: number;
	speedMultiplier: number;
	rewardMultiplier: number;
	spawnRate: number;
	population: number;
	eliteChance: number;
}

/** All monster pacing knobs live here so balance does not leak into systems. */
export const MONSTER_DIRECTOR_CONFIG = {
	initialSpawnDelayS: 0.5,
	/** Normal and elite monsters may use the full gameplay population. */
	maxPopulation: MONSTER_MAX_POPULATION,
	/** Reserved capacity that normal population filling can never consume. */
	bossSlotCapacity: MONSTER_BOSS_SLOT_CAPACITY,
	totalPopulationCapacity:
		MONSTER_MAX_POPULATION + MONSTER_BOSS_SLOT_CAPACITY,
	additionalPopulationPerPlayer: 12,
	maxSpawnsPerTick: 8,
	spawnBudgetCap: 12,
	spawnRingRadius: CHUNK_DISPLAY_RADIUS,
	spawnPointSearchRadiusCells: 1.5,
	boundaryPadding: 8,
	maxContactAttackersPerPlayer: 8,
	bossContactAttackersBonus: 1,
	maxSummonedSpawnsPerTick: 24,
	childSpawnRadius: 1.5,
	summonSpawnRadius: 3,
	chargeTriggerDistance: 18,
	bomberDetonationDistanceMultiplier: 0.65,
	preferredRangePadding: 3,
	preferredRangeBuffer: 1,
	targetSwitchDistanceMultiplier: 1.2,
	/** PBD contact broad phase. Sized for the largest current elite pair. */
	separationCellSize: 4,
	separationRadiusMultiplier: 0.78,
	separationPadding: 0.35,
	separationNeighborSkin: 0.75,
	separationFullCacheRefreshTicks: 20,
	separationMaxNeighbors: 192,
	separationMaxCandidateChecks: 192,
	separationIterations: 3,
	separationRelaxation: 1,
	separationSleepMovementEpsilon: 0.01,
	separationSleepStableTicks: 20,
	separationWakePenetration: 0.08,
	/** Network snapshots; authoritative simulation and combat still run every tick. */
	monsterTransformPublishIntervalS: 0.1,
	positionPublishEpsilon: 0.002,
	rotationPublishEpsilon: 0.005,
	combatSpatialQueryPadding: 8,
	/** Authoritative knockback impulse tuning. */
	knockbackDurationS: 0.3,
	knockbackResistanceExponent: 0.5,
	knockbackMaximumSpeed: 45,
	minimumAttackCooldownS: 0.25,
	initialAttackCooldownS: 0.25,
	initialSpecialCooldownS: 1.5,
	initialChargeCooldownS: 0.75,
	stressTestPopulation: MONSTER_MAX_POPULATION,
	stressTestMaxSpawnsPerTick: 96,
	stressTestEliteChance: 0.05,
	maxElitePopulationRatio: 0.05,
	eliteHealthMultiplier: 2.35,
	eliteDamageMultiplier: 1.3,
	eliteRewardMultiplier: 2.5,
	bossFirstTimeS: 300,
	bossIntervalS: 300,
	bossHealthPerAdditionalPlayer: 0.3,
	bossMaxAlive: 1,
	stages: [
		{
			startTimeS: 0,
			healthMultiplier: 0.72,
			damageMultiplier: 0.65,
			speedMultiplier: 0.92,
			rewardMultiplier: 1,
			spawnRate: 8,
			population: MONSTER_BASE_POPULATION,
			eliteChance: 0.05,
		},
		{
			startTimeS: 120,
			healthMultiplier: 0.82,
			damageMultiplier: 0.72,
			speedMultiplier: 0.96,
			rewardMultiplier: 1.02,
			spawnRate: 10,
			population: 30,
			eliteChance: 0.05,
		},
		{
			startTimeS: 300,
			healthMultiplier: 0.95,
			damageMultiplier: 0.82,
			speedMultiplier: 1,
			rewardMultiplier: 1.05,
			spawnRate: 13,
			population: 52,
			eliteChance: 0.05,
		},
		{
			startTimeS: 600,
			healthMultiplier: 1.1,
			damageMultiplier: 0.95,
			speedMultiplier: 1.04,
			rewardMultiplier: 1.1,
			spawnRate: 17,
			population: 82,
			eliteChance: 0.05,
		},
		{
			startTimeS: 900,
			healthMultiplier: 1.28,
			damageMultiplier: 1.08,
			speedMultiplier: 1.08,
			rewardMultiplier: 1.16,
			spawnRate: 21,
			population: 112,
			eliteChance: 0.05,
		},
		{
			startTimeS: 1200,
			healthMultiplier: 1.48,
			damageMultiplier: 1.22,
			speedMultiplier: 1.12,
			rewardMultiplier: 1.22,
			spawnRate: 25,
			population: 140,
			eliteChance: 0.05,
		},
		{
			startTimeS: 1800,
			healthMultiplier: 1.72,
			damageMultiplier: 1.38,
			speedMultiplier: 1.16,
			rewardMultiplier: 1.3,
			spawnRate: 29,
			population: 165,
			eliteChance: 0.05,
		},
		{
			startTimeS: 2400,
			healthMultiplier: 2,
			damageMultiplier: 1.55,
			speedMultiplier: 1.2,
			rewardMultiplier: 1.38,
			spawnRate: 33,
			population: MONSTER_MAX_POPULATION,
			eliteChance: 0.05,
		},
	] as const satisfies readonly DifficultyStage[],
} as const;

function interpolate(a: number, b: number, amount: number): number {
	return a + (b - a) * amount;
}

/** Returns a smoothly interpolated difficulty stage for the current run time. */
export function difficultyStageAt(elapsedSeconds: number): DifficultyStage {
	const elapsed = Math.max(
		0,
		Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0,
	);
	const stages = MONSTER_DIRECTOR_CONFIG.stages;
	let current: DifficultyStage = stages[0];
	for (let index = 1; index < stages.length; index++) {
		if (elapsed < stages[index].startTimeS) {
			const next = stages[index];
			const amount =
				(elapsed - current.startTimeS) /
				(next.startTimeS - current.startTimeS);
			return {
				startTimeS: current.startTimeS,
				healthMultiplier: interpolate(
					current.healthMultiplier,
					next.healthMultiplier,
					amount,
				),
				damageMultiplier: interpolate(
					current.damageMultiplier,
					next.damageMultiplier,
					amount,
				),
				speedMultiplier: interpolate(
					current.speedMultiplier,
					next.speedMultiplier,
					amount,
				),
				rewardMultiplier: interpolate(
					current.rewardMultiplier,
					next.rewardMultiplier,
					amount,
				),
				spawnRate: interpolate(
					current.spawnRate,
					next.spawnRate,
					amount,
				),
				population: Math.round(
					interpolate(current.population, next.population, amount),
				),
				eliteChance: interpolate(
					current.eliteChance,
					next.eliteChance,
					amount,
				),
			};
		}
		current = stages[index];
	}
	return current;
}

/**
 * Calculates immutable spawn-time stats from the archetype, stage and rank.
 * Existing monsters are never rescaled, so difficulty cannot heal them.
 */
export function computeArchetypeStats(
	kind: string,
	elapsedSeconds: number,
	rank: MonsterRank = 'normal',
	playerCount = 1,
): MonsterRuntimeStats {
	const definition = getMonsterDefinition(kind);
	const stage = difficultyStageAt(elapsedSeconds);
	const base = definition?.baseStats ?? {
		maxLife: MONSTER_BASE_LIFE,
		damage: MONSTER_BASE_DAMAGE,
		moveSpeed: MONSTER_MOVE_SPEED,
		attackRange: MONSTER_ATTACK_RANGE,
		attackCooldownS: MONSTER_ATTACK_COOLDOWN_S,
		knockbackResistance: 0,
	};
	const effectiveRank = definition?.rank === 'boss' ? 'boss' : rank;
	const rankHealth =
		effectiveRank === 'elite'
			? MONSTER_DIRECTOR_CONFIG.eliteHealthMultiplier
			: 1;
	const rankDamage =
		effectiveRank === 'elite'
			? MONSTER_DIRECTOR_CONFIG.eliteDamageMultiplier
			: 1;
	const rankReward =
		effectiveRank === 'elite'
			? MONSTER_DIRECTOR_CONFIG.eliteRewardMultiplier
			: 1;
	const safePlayerCount = Number.isFinite(playerCount)
		? Math.max(0, Math.trunc(playerCount))
		: 0;
	const bossPlayerScale =
		effectiveRank === 'boss'
			? 1 +
				Math.max(0, safePlayerCount - 1) *
					MONSTER_DIRECTOR_CONFIG.bossHealthPerAdditionalPlayer
			: 1;
	return {
		maxLife: Math.max(
			1,
			Math.round(
				base.maxLife *
					stage.healthMultiplier *
					rankHealth *
					bossPlayerScale,
			),
		),
		damage: Math.max(
			1,
			Math.round(base.damage * stage.damageMultiplier * rankDamage),
		),
		xpReward: Math.max(
			1,
			Math.round(
				(definition?.rewardXp ?? MONSTER_BASE_XP_REWARD) *
					stage.rewardMultiplier *
					rankReward,
			),
		),
		moveSpeed: Math.max(0, base.moveSpeed * stage.speedMultiplier),
		attackRange: Math.max(0, base.attackRange),
		attackCooldownS: Math.max(
			MONSTER_DIRECTOR_CONFIG.minimumAttackCooldownS,
			base.attackCooldownS,
		),
		knockbackResistance: Math.min(1, Math.max(0, base.knockbackResistance)),
	};
}

/** Returns the desired normal/elite population for a room at the current time. */
export function targetPopulation(
	elapsedSeconds: number,
	playerCount = 1,
): number {
	const stage = difficultyStageAt(elapsedSeconds);
	const players = Number.isFinite(playerCount)
		? Math.max(0, Math.trunc(playerCount))
		: 0;
	if (players === 0) return 0;
	const population =
		stage.population +
		(players - 1) * MONSTER_DIRECTOR_CONFIG.additionalPopulationPerPlayer;
	return Math.min(
		MONSTER_DIRECTOR_CONFIG.maxPopulation,
		Math.max(0, population),
	);
}

export function bossTimeAt(index: number): number {
	return (
		MONSTER_DIRECTOR_CONFIG.bossFirstTimeS +
		Math.max(0, Math.trunc(index)) * MONSTER_DIRECTOR_CONFIG.bossIntervalS
	);
}

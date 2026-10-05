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

const stage = (
	startTimeS: number,
	healthMultiplier: number,
	damageMultiplier: number,
	speedMultiplier: number,
	rewardMultiplier: number,
	spawnRate: number,
	population: number,
): DifficultyStage => ({
	startTimeS,
	healthMultiplier,
	damageMultiplier,
	speedMultiplier,
	rewardMultiplier,
	spawnRate,
	population,
	eliteChance: 0.05,
});

const INTERPOLATED_KEYS = [
	'healthMultiplier',
	'damageMultiplier',
	'speedMultiplier',
	'rewardMultiplier',
	'spawnRate',
	'population',
	'eliteChance',
] as const satisfies readonly (keyof DifficultyStage)[];

export const MONSTER_DIRECTOR_CONFIG = {
	initialSpawnDelayS: 0.5,
	maxPopulation: MONSTER_MAX_POPULATION,
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
	monsterTransformPublishIntervalS: 0.1,
	positionPublishEpsilon: 0.002,
	rotationPublishEpsilon: 0.005,
	combatSpatialQueryPadding: 8,
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
	bossFirstTimeS: 120,
	bossIntervalS: 120,
	bossHealthPerAdditionalPlayer: 0.3,
	bossMaxAlive: 1,
	stages: [
		// startTimeS, health, damage, speed, reward, spawnRate, population
		stage(0, 0.72, 0.65, 0.92, 1, 8, MONSTER_BASE_POPULATION),
		stage(120, 0.82, 0.72, 0.96, 1.02, 10, 30),
		stage(300, 0.95, 0.82, 1, 1.05, 13, 52),
		stage(600, 1.1, 0.95, 1.04, 1.1, 17, 82),
		stage(900, 1.28, 1.08, 1.08, 1.16, 21, 112),
		stage(1200, 1.48, 1.22, 1.12, 1.22, 25, 140),
		stage(1800, 1.72, 1.38, 1.16, 1.3, 29, 165),
		stage(2400, 2, 1.55, 1.2, 1.38, 33, MONSTER_MAX_POPULATION),
	] as const satisfies readonly DifficultyStage[],
} as const;

function interpolate(a: number, b: number, amount: number): number {
	return a + (b - a) * amount;
}

export function difficultyStageAt(elapsedSeconds: number): DifficultyStage {
	const elapsed = Math.max(
		0,
		Number.isFinite(elapsedSeconds) ? elapsedSeconds : 0,
	);
	const stages = MONSTER_DIRECTOR_CONFIG.stages;
	let current: DifficultyStage = stages[0];
	for (let index = 1; index < stages.length; index++) {
		const next: DifficultyStage = stages[index];
		if (elapsed < next.startTimeS) {
			const amount =
				(elapsed - current.startTimeS) /
				(next.startTimeS - current.startTimeS);
			const result = { ...current };
			for (const key of INTERPOLATED_KEYS)
				result[key] = interpolate(current[key], next[key], amount);
			result.population = Math.round(result.population);
			return result;
		}
		current = next;
	}
	return current;
}

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

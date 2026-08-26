import type {
	BossKind,
	MonsterAiKind,
	MonsterKind,
	MonsterRank,
	MonsterRole,
} from '../utils/Types';

type MonsterSpecialKind = 'none' | 'burst' | 'slam' | 'summon';

interface MonsterBaseStats {
	maxLife: number;
	damage: number;
	moveSpeed: number;
	attackRange: number;
	attackCooldownS: number;
	knockbackResistance: number;
}

interface MonsterAiConfig {
	kind: MonsterAiKind;
	movementSpeedMultiplier: number;
	contactDamageMultiplier: number;
	chargeDamageMultiplier: number;
	preferredRange: number;
	retreatRange: number;
	specialKind: MonsterSpecialKind;
	specialCooldownS: number;
	specialRadius: number;
	specialDamageMultiplier: number;
	chargeSpeedMultiplier: number;
	chargeDurationS: number;
	chargeCooldownS: number;
	summonKind?: MonsterKind;
	summonCount: number;
}

interface MonsterSpawnConfig {
	weight: number;
	minTimeS: number;
	cost: number;
	canBeElite: boolean;
}

export interface MonsterDefinition {
	kind: MonsterKind | BossKind;
	rank: MonsterRank;
	role: MonsterRole;
	modelId: string;
	displayName: string;
	baseStats: MonsterBaseStats;
	ai: MonsterAiConfig;
	spawn: MonsterSpawnConfig;
	rewardXp: number;
	visualScale: number;
	onDeath?: {
		kind: MonsterKind;
		count: number;
	};
}

const normalAi = (
	kind: MonsterAiKind,
	options: Partial<Omit<MonsterAiConfig, 'kind'>> = {},
): MonsterAiConfig => ({
	kind,
	movementSpeedMultiplier: 1,
	contactDamageMultiplier: 1,
	chargeDamageMultiplier: 1.8,
	preferredRange: 0,
	retreatRange: 0,
	specialKind: 'none',
	specialCooldownS: Number.POSITIVE_INFINITY,
	specialRadius: 0,
	specialDamageMultiplier: 1,
	chargeSpeedMultiplier: 1,
	chargeDurationS: 0,
	chargeCooldownS: Number.POSITIVE_INFINITY,
	summonCount: 0,
	...options,
});

const normalSpawn = (
	weight: number,
	minTimeS: number,
	cost = 1,
): MonsterSpawnConfig => ({
	weight,
	minTimeS,
	cost,
	canBeElite: true,
});

const normalStats = (
	maxLife: number,
	damage: number,
	moveSpeed: number,
	attackRange: number,
	attackCooldownS: number,
	knockbackResistance: number,
): MonsterBaseStats => ({
	maxLife,
	damage,
	moveSpeed,
	attackRange,
	attackCooldownS,
	knockbackResistance,
});

/**
 * Single source of truth for monster gameplay. The UI only maps modelId to an
 * asset; the server uses every other field to create and simulate monsters.
 */
export const MONSTER_DEFINITIONS = {
	grunt: {
		kind: 'grunt',
		rank: 'normal',
		role: 'chaser',
		modelId: 'dog',
		displayName: 'Hound',
		baseStats: normalStats(38, 4, 7.2, 1, 1.4, 0),
		ai: normalAi('chaser'),
		spawn: normalSpawn(36, 0),
		rewardXp: 6,
		visualScale: 1,
	},
	skitter: {
		kind: 'skitter',
		rank: 'normal',
		role: 'swarm',
		modelId: 'blob',
		displayName: 'Skitter',
		baseStats: normalStats(22, 2.5, 10.5, 0.8, 1.8, 0),
		ai: normalAi('swarm', { movementSpeedMultiplier: 1.03 }),
		spawn: normalSpawn(30, 0),
		rewardXp: 5,
		visualScale: 0.82,
	},
	kraklet: {
		kind: 'kraklet',
		rank: 'normal',
		role: 'tank',
		modelId: 'cactoro',
		displayName: 'Kraklet',
		baseStats: normalStats(115, 7, 4.2, 1.25, 1.9, 0.72),
		ai: normalAi('tank'),
		spawn: normalSpawn(10, 90),
		rewardXp: 14,
		visualScale: 1.08,
	},
	ravager: {
		kind: 'ravager',
		rank: 'normal',
		role: 'charger',
		modelId: 'ninja',
		displayName: 'Ravager',
		baseStats: normalStats(48, 8, 6.2, 1.1, 1.8, 0.15),
		ai: normalAi('charger', {
			chargeSpeedMultiplier: 2.4,
			chargeDurationS: 0.75,
			chargeCooldownS: 5,
		}),
		spawn: normalSpawn(14, 120),
		rewardXp: 11,
		visualScale: 1,
	},
	venomweb: {
		kind: 'venomweb',
		rank: 'normal',
		role: 'ranged',
		modelId: 'spikyBlob',
		displayName: 'Venomweb',
		baseStats: normalStats(58, 5, 4.4, 1, 2.1, 0.2),
		ai: normalAi('ranged', {
			preferredRange: 12,
			retreatRange: 7,
			specialKind: 'burst',
			specialCooldownS: 4.5,
			specialRadius: 2.4,
			specialDamageMultiplier: 0.75,
		}),
		spawn: normalSpawn(12, 180),
		rewardXp: 12,
		visualScale: 0.95,
	},
	bomber: {
		kind: 'bomber',
		rank: 'normal',
		role: 'bomber',
		modelId: 'cactoro',
		displayName: 'Bombardier',
		baseStats: normalStats(34, 5, 8, 1.25, 2.4, 0.05),
		ai: normalAi('bomber', {
			specialKind: 'burst',
			specialCooldownS: 2.5,
			specialRadius: 4.5,
			specialDamageMultiplier: 2.2,
		}),
		spawn: normalSpawn(8, 300),
		rewardXp: 13,
		visualScale: 0.9,
	},
	splitter: {
		kind: 'splitter',
		rank: 'normal',
		role: 'swarm',
		modelId: 'blob',
		displayName: 'Splitter',
		baseStats: normalStats(70, 4.5, 5.4, 1, 1.9, 0.25),
		ai: normalAi('chaser'),
		spawn: normalSpawn(8, 360),
		rewardXp: 17,
		visualScale: 1.05,
		onDeath: { kind: 'skitter', count: 2 },
	},
	necromancer: {
		kind: 'necromancer',
		rank: 'normal',
		role: 'summoner',
		modelId: 'ninja',
		displayName: 'Gravecaller',
		baseStats: normalStats(92, 4, 3.5, 1, 2.2, 0.35),
		ai: normalAi('summoner', {
			preferredRange: 14,
			retreatRange: 8,
			specialKind: 'summon',
			specialCooldownS: 7,
			summonKind: 'skitter',
			summonCount: 2,
		}),
		spawn: normalSpawn(6, 480, 2),
		rewardXp: 22,
		visualScale: 1.02,
	},
	wisp: {
		kind: 'wisp',
		rank: 'normal',
		role: 'ranged',
		modelId: 'spikyBlob',
		displayName: 'Wisp',
		baseStats: normalStats(30, 6, 9.2, 0.9, 1.6, 0.05),
		ai: normalAi('ranged', {
			preferredRange: 9,
			retreatRange: 5,
			specialKind: 'burst',
			specialCooldownS: 3.2,
			specialRadius: 1.8,
			specialDamageMultiplier: 0.65,
		}),
		spawn: normalSpawn(7, 600),
		rewardXp: 15,
		visualScale: 0.72,
	},
	brute: {
		kind: 'brute',
		rank: 'normal',
		role: 'tank',
		modelId: 'dog',
		displayName: 'Brute',
		baseStats: normalStats(190, 10, 3.1, 1.5, 2.5, 0.88),
		ai: normalAi('tank'),
		spawn: normalSpawn(4, 720, 2),
		rewardXp: 30,
		visualScale: 1.28,
	},
	arakhnos: {
		kind: 'arakhnos',
		rank: 'boss',
		role: 'boss',
		modelId: 'orcSkull',
		displayName: 'Arakhnos',
		baseStats: normalStats(1500, 12, 3.8, 2.2, 1.8, 0.65),
		ai: normalAi('boss', {
			specialKind: 'summon',
			specialCooldownS: 6,
			summonKind: 'skitter',
			summonCount: 4,
		}),
		spawn: { weight: 0, minTimeS: 300, cost: 0, canBeElite: false },
		rewardXp: 260,
		visualScale: 1,
	},
	gorvath: {
		kind: 'gorvath',
		rank: 'boss',
		role: 'boss',
		modelId: 'yeti',
		displayName: 'Gorvath',
		baseStats: normalStats(2100, 16, 3.1, 2.8, 2.5, 0.9),
		ai: normalAi('boss', {
			specialKind: 'slam',
			specialCooldownS: 5.5,
			specialRadius: 7,
			specialDamageMultiplier: 1.25,
		}),
		spawn: { weight: 0, minTimeS: 300, cost: 0, canBeElite: false },
		rewardXp: 320,
		visualScale: 1,
	},
	khimaera: {
		kind: 'khimaera',
		rank: 'boss',
		role: 'boss',
		modelId: 'demon',
		displayName: 'Khimaera',
		baseStats: normalStats(1750, 13, 4.5, 2, 1.9, 0.45),
		ai: normalAi('boss', {
			preferredRange: 11,
			retreatRange: 6,
			specialKind: 'burst',
			specialCooldownS: 4,
			specialRadius: 3.5,
			specialDamageMultiplier: 1.35,
		}),
		spawn: { weight: 0, minTimeS: 300, cost: 0, canBeElite: false },
		rewardXp: 300,
		visualScale: 1,
	},
	abyssor: {
		kind: 'abyssor',
		rank: 'boss',
		role: 'boss',
		modelId: 'mushroomKing',
		displayName: 'Abyssor',
		baseStats: normalStats(2400, 11, 2.8, 2.3, 2.1, 0.72),
		ai: normalAi('boss', {
			specialKind: 'summon',
			specialCooldownS: 7,
			summonKind: 'venomweb',
			summonCount: 3,
		}),
		spawn: { weight: 0, minTimeS: 300, cost: 0, canBeElite: false },
		rewardXp: 380,
		visualScale: 1,
	},
} as const satisfies Readonly<
	Record<MonsterKind | BossKind, MonsterDefinition>
>;

export function getMonsterDefinition(kind: string) {
	return Object.hasOwn(MONSTER_DEFINITIONS, kind)
		? MONSTER_DEFINITIONS[kind as keyof typeof MONSTER_DEFINITIONS]
		: undefined;
}

export function isBossKind(kind: string): kind is BossKind {
	const definition = getMonsterDefinition(kind);
	return definition?.rank === 'boss';
}

export function normalMonsterDefinitions(
	elapsedSeconds: number,
): readonly MonsterDefinition[] {
	const elapsed = Number.isFinite(elapsedSeconds)
		? Math.max(0, elapsedSeconds)
		: 0;
	return Object.values(MONSTER_DEFINITIONS).filter(
		(definition) =>
			definition.rank !== 'boss' && definition.spawn.minTimeS <= elapsed,
	);
}

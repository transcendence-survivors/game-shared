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
	options: Partial<MonsterAiConfig> = {},
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

interface MonsterSpec {
	/** maxLife, damage, moveSpeed, attackRange, attackCooldownS, knockbackResistance */
	stats: readonly [number, number, number, number, number, number];
	/** weight, minTimeS, cost (default 1); omitted for bosses */
	spawn?: readonly [number, number, number?];
	xp: number;
	scale?: number;
	/** overrides of the default AI; `kind` defaults to the role */
	ai?: Partial<MonsterAiConfig>;
	onDeath?: MonsterDefinition['onDeath'];
}

/** Keeps literal kind/role/modelId/displayName types (ui indexes models by modelId). */
function def<
	const K extends MonsterKind | BossKind,
	const R extends MonsterRole,
	const M extends string,
	const N extends string,
>(
	kind: K,
	role: R,
	modelId: M,
	displayName: N,
	{ stats, spawn, xp, scale = 1, ai, onDeath }: MonsterSpec,
): MonsterDefinition & {
	kind: K;
	role: R;
	modelId: M;
	displayName: N;
} {
	const [maxLife, damage, moveSpeed, attackRange, attackCooldownS, kbRes] =
		stats;
	return {
		kind,
		rank: role === 'boss' ? 'boss' : 'normal',
		role,
		modelId,
		displayName,
		baseStats: {
			maxLife,
			damage,
			moveSpeed,
			attackRange,
			attackCooldownS,
			knockbackResistance: kbRes,
		},
		ai: normalAi(role, ai),
		spawn: spawn
			? {
					weight: spawn[0],
					minTimeS: spawn[1],
					cost: spawn[2] ?? 1,
					canBeElite: true,
				}
			: { weight: 0, minTimeS: 300, cost: 0, canBeElite: false },
		rewardXp: xp,
		visualScale: scale,
		...(onDeath && { onDeath }),
	};
}

export const MONSTER_DEFINITIONS = {
	grunt: def('grunt', 'chaser', 'dog', 'Hound', {
		stats: [38, 4, 7.2, 1, 1.4, 0],
		spawn: [36, 0],
		xp: 6,
	}),
	skitter: def('skitter', 'swarm', 'blob', 'Skitter', {
		stats: [22, 2.5, 10.5, 0.8, 1.8, 0],
		spawn: [30, 0],
		xp: 5,
		scale: 0.82,
		ai: { movementSpeedMultiplier: 1.03 },
	}),
	kraklet: def('kraklet', 'tank', 'cactoro', 'Kraklet', {
		stats: [115, 7, 4.2, 1.25, 1.9, 0.72],
		spawn: [10, 90],
		xp: 14,
		scale: 1.08,
	}),
	ravager: def('ravager', 'charger', 'ninja', 'Ravager', {
		stats: [48, 8, 6.2, 1.1, 1.8, 0.15],
		spawn: [14, 120],
		xp: 11,
		ai: {
			chargeSpeedMultiplier: 2.4,
			chargeDurationS: 0.75,
			chargeCooldownS: 5,
		},
	}),
	venomweb: def('venomweb', 'ranged', 'spikyBlob', 'Venomweb', {
		stats: [58, 5, 4.4, 1, 2.1, 0.2],
		spawn: [12, 180],
		xp: 12,
		scale: 0.95,
		ai: {
			preferredRange: 12,
			retreatRange: 7,
			specialKind: 'burst',
			specialCooldownS: 4.5,
			specialRadius: 2.4,
			specialDamageMultiplier: 0.75,
		},
	}),
	bomber: def('bomber', 'bomber', 'mushnub', 'Bombardier', {
		stats: [34, 5, 8, 1.25, 2.4, 0.05],
		spawn: [8, 300],
		xp: 13,
		scale: 0.9,
		ai: {
			specialKind: 'burst',
			specialCooldownS: 2.5,
			specialRadius: 4.5,
			specialDamageMultiplier: 2.2,
		},
	}),
	splitter: def('splitter', 'swarm', 'pinkBlob', 'Splitter', {
		stats: [70, 4.5, 5.4, 1, 1.9, 0.25],
		spawn: [8, 360],
		xp: 17,
		scale: 1.05,
		ai: { kind: 'chaser' },
		onDeath: { kind: 'skitter', count: 2 },
	}),
	necromancer: def('necromancer', 'summoner', 'wizard', 'Gravecaller', {
		stats: [92, 4, 3.5, 1, 2.2, 0.35],
		spawn: [6, 480, 2],
		xp: 22,
		scale: 1.02,
		ai: {
			preferredRange: 14,
			retreatRange: 8,
			specialKind: 'summon',
			specialCooldownS: 7,
			summonKind: 'skitter',
			summonCount: 2,
		},
	}),
	wisp: def('wisp', 'ranged', 'ghost', 'Wisp', {
		stats: [30, 6, 9.2, 0.9, 1.6, 0.05],
		spawn: [7, 600],
		xp: 15,
		scale: 0.72,
		ai: {
			preferredRange: 9,
			retreatRange: 5,
			specialKind: 'burst',
			specialCooldownS: 3.2,
			specialRadius: 1.8,
			specialDamageMultiplier: 0.65,
		},
	}),
	brute: def('brute', 'tank', 'orc', 'Brute', {
		stats: [190, 10, 3.1, 1.5, 2.5, 0.88],
		spawn: [4, 720, 2],
		xp: 30,
		scale: 1.28,
	}),
	arakhnos: def('arakhnos', 'boss', 'orcSkull', 'Arakhnos', {
		stats: [1500, 12, 3.8, 2.2, 1.8, 0.92],
		xp: 260,
		ai: {
			specialKind: 'summon',
			specialCooldownS: 6,
			summonKind: 'skitter',
			summonCount: 4,
		},
	}),
	gorvath: def('gorvath', 'boss', 'yeti', 'Gorvath', {
		stats: [2100, 16, 3.1, 2.8, 2.5, 0.97],
		xp: 320,
		ai: {
			specialKind: 'slam',
			specialCooldownS: 5.5,
			specialRadius: 7,
			specialDamageMultiplier: 1.25,
		},
	}),
	khimaera: def('khimaera', 'boss', 'demon', 'Khimaera', {
		stats: [1750, 13, 4.5, 2, 1.9, 0.9],
		xp: 300,
		ai: {
			preferredRange: 11,
			retreatRange: 6,
			specialKind: 'burst',
			specialCooldownS: 4,
			specialRadius: 3.5,
			specialDamageMultiplier: 1.35,
		},
	}),
	abyssor: def('abyssor', 'boss', 'mushroomKing', 'Abyssor', {
		stats: [2400, 11, 2.8, 2.3, 2.1, 0.94],
		xp: 380,
		ai: {
			specialKind: 'summon',
			specialCooldownS: 7,
			summonKind: 'venomweb',
			summonCount: 3,
		},
	}),
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

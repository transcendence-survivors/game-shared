import type {
	CombatLimits,
	WeaponConfig,
	WeaponLevelScaling,
} from './WeaponConfig';

export const COMBAT_CONFIG_VERSION = 1;

export const DEFAULT_WEAPON_LEVEL_SCALING = [
	{ damage: 1, attackRate: 1, range: 1, duration: 1 },
	{ damage: 1.2, attackRate: 1, range: 1, duration: 1 },
	{ damage: 1.2, attackRate: 1.15, range: 1, duration: 1 },
	{ damage: 1.45, attackRate: 1.15, range: 1.15, duration: 1 },
	{ damage: 1.7, attackRate: 1.3, range: 1.15, duration: 1.2 },
] as const satisfies readonly WeaponLevelScaling[];

export const COMBAT_LIMITS = {
	maxPlayers: 4,
	maxWeaponsPerPlayer: 5,
	maxWeaponLevel: 5,
	maxFinalAttackRate: 8,
	maxProjectilesPerPlayer: 32,
	maxCombatEntitiesPerRoom: 128,
	maxImpactEventsPerTick: 256,
	maxCatchupAttacksPerTick: 4,
	maxEntityLifetimeS: 10,
} as const satisfies CombatLimits;

const FULL_AFFINITY = {
	damage: 1,
	attackRate: 1,
	range: 1,
	size: 1,
} as const;

export const WEAPON_CONFIGS = [
	{
		kind: 'aura',
		behavior: 'aura',
		maxLevel: 5,
		baseDamage: 5,
		baseAttackRate: 1,
		baseRadius: 6,
		maxActiveEntities: 1,
		bonusAffinity: { ...FULL_AFFINITY, attackRate: 0.8 },
		levelScaling: DEFAULT_WEAPON_LEVEL_SCALING,
	},
	{
		kind: 'sword',
		behavior: 'sector',
		maxLevel: 5,
		baseDamage: 18,
		baseAttackRate: 1.25,
		baseRange: 4.5,
		totalAngleDegrees: 100,
		targetHitboxRadius: 0.75,
		effectLifetimeS: 0.25,
		maxActiveEntities: 2,
		bonusAffinity: { ...FULL_AFFINITY, range: 0.65 },
		levelScaling: DEFAULT_WEAPON_LEVEL_SCALING,
	},
	{
		kind: 'axe',
		behavior: 'stationary-projectile',
		maxLevel: 5,
		baseDamage: 12,
		baseAttackRate: 0.25,
		baseProjectileSpeed: 14,
		baseTravelDistance: 8,
		baseContactRadius: 2.25,
		damageIntervalS: 0.5,
		baseActiveDurationS: 3,
		maxActiveEntities: 2,
		bonusAffinity: { ...FULL_AFFINITY, attackRate: 0.5, size: 1.25 },
		levelScaling: DEFAULT_WEAPON_LEVEL_SCALING,
	},
	{
		kind: 'staff',
		behavior: 'targeted-projectile',
		maxLevel: 5,
		baseDamage: 24,
		baseAttackRate: 0.65,
		baseAcquisitionRange: 30,
		baseProjectileSpeed: 18,
		maxTurnRateDegreesS: 240,
		collisionRadius: 0.65,
		maxLifetimeS: 3,
		penetration: 0,
		maxActiveEntities: 4,
		bonusAffinity: { ...FULL_AFFINITY, range: 1.25 },
		levelScaling: DEFAULT_WEAPON_LEVEL_SCALING,
	},
	{
		kind: 'bow',
		behavior: 'spread-projectile',
		maxLevel: 5,
		baseDamage: 10,
		baseAttackRate: 1,
		projectileCount: 3,
		spreadAnglesDegrees: [-12, 0, 12],
		baseProjectileSpeed: 28,
		collisionRadius: 0.25,
		maxLifetimeS: 1.5,
		penetration: 0,
		maxActiveEntities: 12,
		bonusAffinity: { ...FULL_AFFINITY, damage: 0.8, attackRate: 1.2 },
		levelScaling: DEFAULT_WEAPON_LEVEL_SCALING,
	},
] as const satisfies readonly WeaponConfig[];

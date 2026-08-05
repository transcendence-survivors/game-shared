import type { WeaponKind } from '../utils/Types';

export interface WeaponLevelScaling {
	damage: number;
	attackRate: number;
	range: number;
	duration: number;
}

export interface BaseWeaponConfig {
	kind: WeaponKind;
	maxLevel: number;
	baseDamage: number;
	baseAttackRate: number;
	maxActiveEntities: number;
	levelScaling: readonly WeaponLevelScaling[];
}

export interface AuraWeaponConfig extends BaseWeaponConfig {
	kind: 'aura';
	behavior: 'aura';
	baseRadius: number;
}

export interface SwordWeaponConfig extends BaseWeaponConfig {
	kind: 'sword';
	behavior: 'sector';
	baseRange: number;
	totalAngleDegrees: number;
	effectLifetimeS: number;
}

export interface AxeWeaponConfig extends BaseWeaponConfig {
	kind: 'axe';
	behavior: 'stationary-projectile';
	baseProjectileSpeed: number;
	baseTravelDistance: number;
	baseContactRadius: number;
	damageIntervalS: number;
	baseActiveDurationS: number;
}

export interface StaffWeaponConfig extends BaseWeaponConfig {
	kind: 'staff';
	behavior: 'targeted-projectile';
	baseAcquisitionRange: number;
	baseProjectileSpeed: number;
	maxTurnRateDegreesS: number;
	collisionRadius: number;
	maxLifetimeS: number;
	penetration: number;
}

export interface BowWeaponConfig extends BaseWeaponConfig {
	kind: 'bow';
	behavior: 'spread-projectile';
	projectileCount: number;
	spreadAnglesDegrees: readonly number[];
	baseProjectileSpeed: number;
	collisionRadius: number;
	maxLifetimeS: number;
	penetration: number;
}

export type WeaponConfig =
	| AuraWeaponConfig
	| SwordWeaponConfig
	| AxeWeaponConfig
	| StaffWeaponConfig
	| BowWeaponConfig;

export interface CombatLimits {
	maxPlayers: number;
	maxWeaponsPerPlayer: number;
	maxWeaponLevel: number;
	maxFinalAttackRate: number;
	maxProjectilesPerPlayer: number;
	maxCombatEntitiesPerRoom: number;
	maxImpactEventsPerTick: number;
	maxCatchupAttacksPerTick: number;
	maxEntityLifetimeS: number;
}

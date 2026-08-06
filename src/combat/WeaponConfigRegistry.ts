import { WEAPON_KINDS } from '../utils/Constants';
import type { WeaponKind } from '../utils/Types';
import type {
	CombatLimits,
	WeaponConfig,
	WeaponLevelScaling,
} from './WeaponConfig';
import {
	COMBAT_CONFIG_VERSION,
	COMBAT_LIMITS,
	WEAPON_CONFIGS,
} from './WeaponConfigs';

function requireFinitePositive(name: string, value: number): void {
	if (!Number.isFinite(value) || value <= 0)
		throw new RangeError(`${name} must be finite and positive`);
}

function requireFiniteNonNegative(name: string, value: number): void {
	if (!Number.isFinite(value) || value < 0)
		throw new RangeError(`${name} must be finite and non-negative`);
}

function requireInteger(name: string, value: number): void {
	if (!Number.isInteger(value))
		throw new RangeError(`${name} must be an integer`);
}

function deepFreeze<T>(value: T): Readonly<T> {
	if (value && typeof value === 'object' && !Object.isFrozen(value)) {
		Object.freeze(value);
		for (const nested of Object.values(value as Record<string, unknown>))
			deepFreeze(nested);
	}
	return value;
}

function validateScaling(
	kind: WeaponKind,
	maxLevel: number,
	scaling: readonly WeaponLevelScaling[],
): void {
	if (scaling.length !== maxLevel)
		throw new RangeError(`${kind}.levelScaling must match maxLevel`);
	for (const [index, level] of scaling.entries()) {
		requireFinitePositive(`${kind}.levelScaling[${index}].damage`, level.damage);
		requireFinitePositive(
			`${kind}.levelScaling[${index}].attackRate`,
			level.attackRate,
		);
		requireFinitePositive(`${kind}.levelScaling[${index}].range`, level.range);
		requireFinitePositive(
			`${kind}.levelScaling[${index}].duration`,
			level.duration,
		);
	}
}

function validateBase(config: WeaponConfig, limits: CombatLimits): void {
	requireInteger(`${config.kind}.maxLevel`, config.maxLevel);
	requireFinitePositive(`${config.kind}.maxLevel`, config.maxLevel);
	if (config.maxLevel > limits.maxWeaponLevel)
		throw new RangeError(`${config.kind}.maxLevel exceeds combat limit`);
	requireFinitePositive(`${config.kind}.baseDamage`, config.baseDamage);
	requireFinitePositive(`${config.kind}.baseAttackRate`, config.baseAttackRate);
	requireInteger(`${config.kind}.maxActiveEntities`, config.maxActiveEntities);
	requireFinitePositive(
		`${config.kind}.maxActiveEntities`,
		config.maxActiveEntities,
	);
	validateScaling(config.kind, config.maxLevel, config.levelScaling);
}

function validateEntityLifetime(
	name: string,
	lifetimeS: number,
	limits: Readonly<CombatLimits>,
): void {
	requireFinitePositive(name, lifetimeS);
	if (lifetimeS > limits.maxEntityLifetimeS)
		throw new RangeError(`${name} exceeds combat limit`);
}

function validateSpecialized(
	config: WeaponConfig,
	limits: Readonly<CombatLimits>,
): void {
	switch (config.kind) {
		case 'aura':
			requireFinitePositive('aura.baseRadius', config.baseRadius);
			return;
		case 'sword':
			requireFinitePositive('sword.baseRange', config.baseRange);
			requireFinitePositive('sword.totalAngleDegrees', config.totalAngleDegrees);
			requireFinitePositive('sword.targetHitboxRadius', config.targetHitboxRadius);
			if (config.totalAngleDegrees > 360)
				throw new RangeError('sword.totalAngleDegrees cannot exceed 360');
			validateEntityLifetime(
				'sword.effectLifetimeS',
				config.effectLifetimeS,
				limits,
			);
			return;
		case 'axe':
			requireFinitePositive('axe.baseProjectileSpeed', config.baseProjectileSpeed);
			requireFinitePositive('axe.baseTravelDistance', config.baseTravelDistance);
			requireFinitePositive('axe.baseContactRadius', config.baseContactRadius);
			requireFinitePositive('axe.damageIntervalS', config.damageIntervalS);
			validateEntityLifetime(
				'axe.totalLifetimeS',
				config.baseTravelDistance / config.baseProjectileSpeed +
					config.baseActiveDurationS,
				limits,
			);
			return;
		case 'staff':
			requireFinitePositive('staff.baseAcquisitionRange', config.baseAcquisitionRange);
			requireFinitePositive('staff.baseProjectileSpeed', config.baseProjectileSpeed);
			requireFinitePositive('staff.maxTurnRateDegreesS', config.maxTurnRateDegreesS);
			requireFinitePositive('staff.collisionRadius', config.collisionRadius);
			validateEntityLifetime(
				'staff.maxLifetimeS',
				config.maxLifetimeS,
				limits,
			);
			requireInteger('staff.penetration', config.penetration);
			requireFiniteNonNegative('staff.penetration', config.penetration);
			return;
		case 'bow':
			requireInteger('bow.projectileCount', config.projectileCount);
			requireFinitePositive('bow.projectileCount', config.projectileCount);
			if (config.spreadAnglesDegrees.length !== config.projectileCount)
				throw new RangeError('bow.spreadAnglesDegrees must match projectileCount');
			for (const [index, angle] of config.spreadAnglesDegrees.entries()) {
				if (!Number.isFinite(angle))
					throw new RangeError(`bow.spreadAnglesDegrees[${index}] must be finite`);
			}
			requireFinitePositive('bow.baseProjectileSpeed', config.baseProjectileSpeed);
			requireFinitePositive('bow.collisionRadius', config.collisionRadius);
			validateEntityLifetime(
				'bow.maxLifetimeS',
				config.maxLifetimeS,
				limits,
			);
			requireInteger('bow.penetration', config.penetration);
			requireFiniteNonNegative('bow.penetration', config.penetration);
	}
}

function validateLimits(limits: Readonly<CombatLimits>): void {
	for (const [name, value] of Object.entries(limits)) {
		requireInteger(`combatLimits.${name}`, value);
		requireFinitePositive(`combatLimits.${name}`, value);
	}
}

export class WeaponConfigRegistry {
	private readonly configs: ReadonlyMap<WeaponKind, Readonly<WeaponConfig>>;
	readonly version: number;
	readonly limits: Readonly<CombatLimits>;

	constructor(
		configs: readonly WeaponConfig[] = WEAPON_CONFIGS,
		limits: Readonly<CombatLimits> = COMBAT_LIMITS,
		version: number = COMBAT_CONFIG_VERSION,
	) {
		requireInteger('combatConfigVersion', version);
		requireFinitePositive('combatConfigVersion', version);
		validateLimits(limits);
		const entries = new Map<WeaponKind, Readonly<WeaponConfig>>();
		for (const config of configs) {
			if (!WEAPON_KINDS.includes(config.kind))
				throw new RangeError(`Unknown weapon kind: ${config.kind}`);
			if (entries.has(config.kind))
				throw new RangeError(`Duplicate weapon config: ${config.kind}`);
			validateBase(config, limits);
			validateSpecialized(config, limits);
			entries.set(config.kind, deepFreeze(config));
		}
		for (const kind of WEAPON_KINDS) {
			if (!entries.has(kind))
				throw new RangeError(`Missing weapon config: ${kind}`);
		}
		this.version = version;
		this.limits = deepFreeze(limits);
		this.configs = entries;
	}

	get<TKind extends WeaponKind>(
		kind: TKind,
	): Readonly<Extract<WeaponConfig, { kind: TKind }>> {
		return this.configs.get(kind) as Readonly<
			Extract<WeaponConfig, { kind: TKind }>
		>;
	}

	all(): readonly Readonly<WeaponConfig>[] {
		return WEAPON_KINDS.map((kind) => this.configs.get(kind)!);
	}
}

export const weaponConfigRegistry = new WeaponConfigRegistry();

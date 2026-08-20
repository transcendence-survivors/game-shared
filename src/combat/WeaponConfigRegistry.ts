import { WEAPON_KINDS } from '../utils/Constants';
import type { WeaponKind } from '../utils/Types';
import type { CombatLimits, WeaponConfig } from './WeaponConfig';
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

function requirePositiveInteger(name: string, value: number): void {
	requireInteger(name, value);
	requireFinitePositive(name, value);
}

function deepFreeze<T>(value: T): Readonly<T> {
	if (value && typeof value === 'object' && !Object.isFrozen(value)) {
		Object.freeze(value);
		for (const nested of Object.values(value as Record<string, unknown>))
			deepFreeze(nested);
	}
	return value;
}

const POSITIVE_FIELDS: Record<WeaponKind, string> = {
	aura: 'baseHeight baseRadius',
	sword: 'hitboxHeight baseRange baseKnockback totalAngleDegrees targetHitboxRadius',
	axe: 'baseContactHeight baseProjectileSpeed baseTravelDistance baseContactRadius damageIntervalS',
	staff: 'baseAcquisitionRange baseProjectileSpeed maxTurnRateDegreesS collisionRadius',
	bow: 'hitboxWidth hitboxHeight hitboxDepth projectileCount baseProjectileSpeed collisionRadius',
};
const INTEGER_FIELDS: Partial<Record<WeaponKind, string>> = {
	staff: 'penetration',
	bow: 'projectileCount penetration',
};
const NON_NEGATIVE_FIELDS: Partial<Record<WeaponKind, string>> = {
	staff: 'penetration',
	bow: 'penetration',
};

function validateFields(
	kind: WeaponKind,
	config: WeaponConfig,
	fields: string,
	validate: (name: string, value: number) => void,
): void {
	if (!fields) return;
	const values = config as unknown as Record<string, number>;
	for (const field of fields.split(' '))
		validate(`${kind}.${field}`, values[field]);
}

function validateBase(config: WeaponConfig, limits: CombatLimits): void {
	requirePositiveInteger(`${config.kind}.maxLevel`, config.maxLevel);
	if (config.maxLevel > limits.maxWeaponLevel)
		throw new RangeError(`${config.kind}.maxLevel exceeds combat limit`);
	validateFields(
		config.kind,
		config,
		'baseDamage baseAttackRate',
		requireFinitePositive,
	);
	requirePositiveInteger(
		`${config.kind}.maxActiveEntities`,
		config.maxActiveEntities,
	);
	for (const [stat, affinity] of Object.entries(config.bonusAffinity))
		requireFiniteNonNegative(
			`${config.kind}.bonusAffinity.${stat}`,
			affinity,
		);
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
	validateFields(
		config.kind,
		config,
		POSITIVE_FIELDS[config.kind],
		requireFinitePositive,
	);
	validateFields(
		config.kind,
		config,
		INTEGER_FIELDS[config.kind] ?? '',
		requireInteger,
	);
	validateFields(
		config.kind,
		config,
		NON_NEGATIVE_FIELDS[config.kind] ?? '',
		requireFiniteNonNegative,
	);
	switch (config.kind) {
		case 'aura':
			return;
		case 'sword':
			if (config.totalAngleDegrees > 360)
				throw new RangeError(
					'sword.totalAngleDegrees cannot exceed 360',
				);
			validateEntityLifetime(
				'sword.effectLifetimeS',
				config.effectLifetimeS,
				limits,
			);
			return;
		case 'axe':
			validateEntityLifetime(
				'axe.totalLifetimeS',
				config.baseTravelDistance / config.baseProjectileSpeed +
					config.baseActiveDurationS,
				limits,
			);
			return;
		case 'staff':
			validateEntityLifetime(
				'staff.maxLifetimeS',
				config.maxLifetimeS,
				limits,
			);
			return;
		case 'bow':
			if (config.spreadAnglesDegrees.length !== config.projectileCount)
				throw new RangeError(
					'bow.spreadAnglesDegrees must match projectileCount',
				);
			for (const [index, angle] of config.spreadAnglesDegrees.entries()) {
				if (!Number.isFinite(angle))
					throw new RangeError(
						`bow.spreadAnglesDegrees[${index}] must be finite`,
					);
			}
			validateEntityLifetime(
				'bow.maxLifetimeS',
				config.maxLifetimeS,
				limits,
			);
	}
}

function validateLimits(limits: Readonly<CombatLimits>): void {
	for (const [name, value] of Object.entries(limits)) {
		requirePositiveInteger(`combatLimits.${name}`, value);
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
		requirePositiveInteger('combatConfigVersion', version);
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

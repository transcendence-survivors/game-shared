import { PLAYER_BASE_RANGE, PLAYER_MAX_LIFE, SPEED } from './Constants';
import type {
	TomeUpgradeDisplayEffect,
	TomeStat,
	TomeId,
	UpgradeIcon,
	UpgradeOption,
	UpgradeRarity,
	WeaponKind,
	WeaponUpgradeDisplayEffect,
	WeaponUpgradeStat,
} from './Types';

export interface WeaponUpgradeBonus {
	stat: WeaponUpgradeStat;
	value: number;
}

type UpgradeEffect =
	| {
			kind: 'tome';
			tomeId: TomeId;
			stat: TomeStat;
			value: number;
			level: number;
			maxLevel: number;
	  }
	| { kind: 'unlock-weapon'; weaponKind: WeaponKind }
	| {
			kind: 'augment-weapon';
			weaponKind: WeaponKind;
			bonuses: WeaponUpgradeBonus[];
			level: number;
			maxLevel: number;
	  };

export interface UpgradeDef {
	id: string;
	iconUrl: UpgradeIcon;
	rarity: UpgradeRarity;
	effect: UpgradeEffect;
}

function tomeDisplayEffect(
	stat: TomeStat,
	value: number,
): TomeUpgradeDisplayEffect {
	switch (stat) {
		case 'attackDamage':
			return { source: 'tome', stat, value, format: 'percent' };
		case 'moveSpeed':
			return {
				source: 'tome',
				stat,
				value: (value / SPEED) * 100,
				format: 'percent',
			};
		case 'maxHealth':
			return {
				source: 'tome',
				stat,
				value: (value / PLAYER_MAX_LIFE) * 100,
				format: 'percent',
			};
		case 'range':
			return {
				source: 'tome',
				stat,
				value: (value / PLAYER_BASE_RANGE) * 100,
				format: 'percent',
			};
		case 'attackSpeed':
		case 'size':
		case 'duration':
		case 'luck':
			return {
				source: 'tome',
				stat,
				value: value * 100,
				format: 'percent',
			};
		case 'lifesteal':
			return { source: 'tome', stat, value, format: 'decimal' };
		case 'armor':
		case 'quantity':
		case 'penetration':
			return { source: 'tome', stat, value, format: 'integer' };
	}
}

function weaponDisplayEffect({
	stat,
	value,
}: WeaponUpgradeBonus): WeaponUpgradeDisplayEffect {
	const integer = stat === 'quantityBonus' || stat === 'penetrationBonus';
	return {
		source: 'weapon',
		stat,
		value: integer ? value : value * 100,
		format: integer ? 'integer' : 'percent',
	};
}

export function toUpgradeOption(upgrade: UpgradeDef): UpgradeOption {
	const { id, iconUrl, rarity, effect } = upgrade;
	switch (effect.kind) {
		case 'tome':
			return {
				id,
				iconUrl,
				rarity,
				category: 'tome',
				tomeId: effect.tomeId,
				level: effect.level,
				effects: [tomeDisplayEffect(effect.stat, effect.value)],
			};
		case 'augment-weapon':
			return {
				id,
				iconUrl,
				rarity,
				category: 'weapon',
				weaponKind: effect.weaponKind,
				level: effect.level,
				effects: effect.bonuses.map(weaponDisplayEffect),
			};
		case 'unlock-weapon':
			return {
				id,
				iconUrl,
				rarity,
				category: 'unlock',
				weaponKind: effect.weaponKind,
				effects: [],
			};
	}
}

export interface TomeDefinition {
	id: TomeId;
	stat: TomeStat;
	baseValue: number;
	maxLevel: number;
	iconUrl: UpgradeDef['iconUrl'];
}

export interface WeaponTraitDefinition {
	stat: WeaponUpgradeStat;
	baseValue: number;
	valueType: 'ratio' | 'integer';
}

export const TOME_SLOT_LIMIT = 4;
export const TOME_MAX_LEVEL = 99;

export const RARITY_CONFIG: Readonly<
	Record<
		UpgradeRarity,
		{
			weight: number;
			valueMultiplier: number;
			weaponStatCount: number;
		}
	>
> = {
	common: {
		weight: 55,
		valueMultiplier: 1,
		weaponStatCount: 1,
	},
	uncommon: {
		weight: 25,
		valueMultiplier: 1.35,
		weaponStatCount: 1,
	},
	rare: {
		weight: 12,
		valueMultiplier: 1.75,
		weaponStatCount: 2,
	},
	epic: {
		weight: 6,
		valueMultiplier: 2.25,
		weaponStatCount: 2,
	},
	legendary: {
		weight: 2,
		valueMultiplier: 3,
		weaponStatCount: 3,
	},
};

export const TOME_DEFINITIONS: readonly TomeDefinition[] = [
	{
		id: 'damage',
		stat: 'attackDamage',
		baseValue: 8,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeDamage',
	},
	{
		id: 'cooldown',
		stat: 'attackSpeed',
		baseValue: 0.075,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeCooldown',
	},
	{
		id: 'agility',
		stat: 'moveSpeed',
		baseValue: SPEED * 0.1,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeAgility',
	},
	{
		id: 'vitality',
		stat: 'maxHealth',
		baseValue: PLAYER_MAX_LIFE * 0.1,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeVitality',
	},
	{
		id: 'armor',
		stat: 'armor',
		baseValue: 1,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeArmor',
	},
	{
		id: 'blood',
		stat: 'lifesteal',
		baseValue: 1.5,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeBlood',
	},
	{
		id: 'range',
		stat: 'range',
		baseValue: 0.8,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeRange',
	},
	{
		id: 'size',
		stat: 'size',
		baseValue: 0.1,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeSize',
	},
	{
		id: 'duration',
		stat: 'duration',
		baseValue: 0.1,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeDuration',
	},
	{
		id: 'quantity',
		stat: 'quantity',
		baseValue: 1,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeQuantity',
	},
	{
		id: 'fortune',
		stat: 'luck',
		baseValue: 0.07,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeFortune',
	},
] as const;

const DAMAGE: WeaponTraitDefinition = {
	stat: 'damageBonus',
	baseValue: 0.1,
	valueType: 'ratio',
};
const ATTACK_RATE: WeaponTraitDefinition = {
	stat: 'attackRateBonus',
	baseValue: 0.08,
	valueType: 'ratio',
};
const RANGE: WeaponTraitDefinition = {
	stat: 'rangeBonus',
	baseValue: 0.1,
	valueType: 'ratio',
};
const DURATION: WeaponTraitDefinition = {
	stat: 'durationBonus',
	baseValue: 0.12,
	valueType: 'ratio',
};
const SIZE: WeaponTraitDefinition = {
	stat: 'sizeBonus',
	baseValue: 0.1,
	valueType: 'ratio',
};
const PROJECTILE_SPEED: WeaponTraitDefinition = {
	stat: 'speedBonus',
	baseValue: 0.12,
	valueType: 'ratio',
};
const QUANTITY: WeaponTraitDefinition = {
	stat: 'quantityBonus',
	baseValue: 1,
	valueType: 'integer',
};
const PENETRATION: WeaponTraitDefinition = {
	stat: 'penetrationBonus',
	baseValue: 1,
	valueType: 'integer',
};
const KNOCKBACK: WeaponTraitDefinition = {
	stat: 'knockbackBonus',
	baseValue: 0.15,
	valueType: 'ratio',
};

export const WEAPON_TRAIT_POOLS: Readonly<
	Record<WeaponKind, readonly WeaponTraitDefinition[]>
> = {
	aura: [DAMAGE, ATTACK_RATE, RANGE, SIZE],
	sword: [DAMAGE, ATTACK_RATE, RANGE, SIZE, KNOCKBACK],
	axe: [DAMAGE, ATTACK_RATE, RANGE, DURATION, SIZE, PROJECTILE_SPEED],
	staff: [
		DAMAGE,
		ATTACK_RATE,
		RANGE,
		DURATION,
		SIZE,
		PROJECTILE_SPEED,
		QUANTITY,
		PENETRATION,
	],
	bow: [
		DAMAGE,
		ATTACK_RATE,
		RANGE,
		DURATION,
		SIZE,
		PROJECTILE_SPEED,
		QUANTITY,
		PENETRATION,
	],
};

export const WEAPON_ICONS: Readonly<Record<WeaponKind, UpgradeIcon>> = {
	aura: 'weaponAura',
	sword: 'weaponSword',
	axe: 'weaponAxe',
	staff: 'weaponStaff',
	bow: 'weaponBow',
};

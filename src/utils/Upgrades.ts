import { PLAYER_MAX_LIFE, SPEED } from './Constants';
import type {
	UpgradeIcon,
	UpgradeOption,
	UpgradeRarity,
	WeaponKind,
} from './Types';

export type TomeStat =
	| 'attackDamage'
	| 'attackSpeed'
	| 'moveSpeed'
	| 'lifesteal'
	| 'range'
	| 'armor'
	| 'maxHealth'
	| 'size'
	| 'duration'
	| 'quantity'
	| 'penetration'
	| 'luck';

export type WeaponUpgradeStat =
	| 'damageBonus'
	| 'attackRateBonus'
	| 'rangeBonus'
	| 'durationBonus'
	| 'sizeBonus'
	| 'speedBonus'
	| 'quantityBonus'
	| 'penetrationBonus'
	| 'knockbackBonus';

export interface WeaponUpgradeBonus {
	stat: WeaponUpgradeStat;
	value: number;
}

type UpgradeEffect =
	| {
			kind: 'tome';
			tomeId: string;
			stat: TomeStat;
			value: number;
			maxLevel: number;
	  }
	| { kind: 'unlock-weapon'; weaponKind: WeaponKind }
	| {
			kind: 'augment-weapon';
			weaponKind: WeaponKind;
			bonuses: WeaponUpgradeBonus[];
			maxLevel: number;
	  };

export interface UpgradeDef extends UpgradeOption {
	effect: UpgradeEffect;
}

export function toUpgradeOption({
	id,
	name,
	description,
	iconUrl,
	rarity,
	category,
}: UpgradeDef): UpgradeOption {
	return { id, name, description, iconUrl, rarity, category };
}

export interface TomeDefinition {
	id: string;
	name: string;
	stat: TomeStat;
	baseValue: number;
	maxLevel: number;
	iconUrl: UpgradeDef['iconUrl'];
	format: 'percent' | 'points' | 'flat' | 'speed-percent';
}

export interface WeaponTraitDefinition {
	stat: WeaponUpgradeStat;
	baseValue: number;
	label: string;
	format: 'percent' | 'integer';
}

export const TOME_SLOT_LIMIT = 4;
export const TOME_MAX_LEVEL = 99;

export const RARITY_CONFIG: Readonly<
	Record<
		UpgradeRarity,
		{
			label: string;
			weight: number;
			valueMultiplier: number;
			weaponStatCount: number;
		}
	>
> = {
	common: {
		label: 'Commun',
		weight: 55,
		valueMultiplier: 1,
		weaponStatCount: 1,
	},
	uncommon: {
		label: 'Inhabituel',
		weight: 25,
		valueMultiplier: 1.35,
		weaponStatCount: 1,
	},
	rare: {
		label: 'Rare',
		weight: 12,
		valueMultiplier: 1.75,
		weaponStatCount: 2,
	},
	epic: {
		label: 'Épique',
		weight: 6,
		valueMultiplier: 2.25,
		weaponStatCount: 2,
	},
	legendary: {
		label: 'Légendaire',
		weight: 2,
		valueMultiplier: 3,
		weaponStatCount: 3,
	},
};

export const TOME_DEFINITIONS: readonly TomeDefinition[] = [
	{
		id: 'damage',
		name: 'Tome de puissance',
		stat: 'attackDamage',
		baseValue: 8,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeDamage',
		format: 'percent',
	},
	{
		id: 'cooldown',
		name: 'Tome de célérité',
		stat: 'attackSpeed',
		baseValue: 0.075,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeCooldown',
		format: 'percent',
	},
	{
		id: 'agility',
		name: "Tome d'agilité",
		stat: 'moveSpeed',
		baseValue: SPEED * 0.1,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeAgility',
		format: 'speed-percent',
	},
	{
		id: 'vitality',
		name: 'Tome de vitalité',
		stat: 'maxHealth',
		baseValue: PLAYER_MAX_LIFE * 0.1,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeVitality',
		format: 'percent',
	},
	{
		id: 'armor',
		name: "Tome d'armure",
		stat: 'armor',
		baseValue: 1,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeArmor',
		format: 'flat',
	},
	{
		id: 'blood',
		name: 'Tome sanguin',
		stat: 'lifesteal',
		baseValue: 1.5,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeBlood',
		format: 'points',
	},
	{
		id: 'range',
		name: 'Tome de portée',
		stat: 'range',
		baseValue: 0.8,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeRange',
		format: 'percent',
	},
	{
		id: 'size',
		name: 'Tome de grandeur',
		stat: 'size',
		baseValue: 0.1,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeSize',
		format: 'percent',
	},
	{
		id: 'duration',
		name: 'Tome de durée',
		stat: 'duration',
		baseValue: 0.1,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeDuration',
		format: 'percent',
	},
	{
		id: 'quantity',
		name: 'Tome de quantité',
		stat: 'quantity',
		baseValue: 1,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeQuantity',
		format: 'flat',
	},
	{
		id: 'fortune',
		name: 'Tome de fortune',
		stat: 'luck',
		baseValue: 0.07,
		maxLevel: TOME_MAX_LEVEL,
		iconUrl: 'tomeFortune',
		format: 'percent',
	},
] as const;

const DAMAGE: WeaponTraitDefinition = {
	stat: 'damageBonus',
	baseValue: 0.1,
	label: 'dégâts',
	format: 'percent',
};
const ATTACK_RATE: WeaponTraitDefinition = {
	stat: 'attackRateBonus',
	baseValue: 0.08,
	label: "vitesse d'attaque",
	format: 'percent',
};
const RANGE: WeaponTraitDefinition = {
	stat: 'rangeBonus',
	baseValue: 0.1,
	label: 'portée',
	format: 'percent',
};
const DURATION: WeaponTraitDefinition = {
	stat: 'durationBonus',
	baseValue: 0.12,
	label: 'durée',
	format: 'percent',
};
const SIZE: WeaponTraitDefinition = {
	stat: 'sizeBonus',
	baseValue: 0.1,
	label: 'taille',
	format: 'percent',
};
const PROJECTILE_SPEED: WeaponTraitDefinition = {
	stat: 'speedBonus',
	baseValue: 0.12,
	label: 'vitesse des projectiles',
	format: 'percent',
};
const QUANTITY: WeaponTraitDefinition = {
	stat: 'quantityBonus',
	baseValue: 1,
	label: 'projectile',
	format: 'integer',
};
const PENETRATION: WeaponTraitDefinition = {
	stat: 'penetrationBonus',
	baseValue: 1,
	label: 'pénétration',
	format: 'integer',
};
const KNOCKBACK: WeaponTraitDefinition = {
	stat: 'knockbackBonus',
	baseValue: 0.15,
	label: 'projection',
	format: 'percent',
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

export const WEAPON_NAMES: Readonly<Record<WeaponKind, string>> = {
	aura: 'Aura',
	sword: 'Épée',
	axe: 'Hache',
	staff: 'Staff',
	bow: 'Arc',
};

export const WEAPON_ICONS: Readonly<Record<WeaponKind, UpgradeIcon>> = {
	aura: 'weaponAura',
	sword: 'weaponSword',
	axe: 'weaponAxe',
	staff: 'weaponStaff',
	bow: 'weaponBow',
};

function displayNumber(value: number): string {
	return String(Number(value.toFixed(1)));
}

export function formatWeaponBonus(
	definition: WeaponTraitDefinition,
	value: number,
): string {
	if (definition.format === 'integer')
		return `+${Math.round(value)} ${definition.label}${value > 1 ? 's' : ''}`;
	return `+${displayNumber(value * 100)} % ${definition.label}`;
}

export function formatTomeValue(
	definition: TomeDefinition,
	value: number,
): string {
	switch (definition.format) {
		case 'speed-percent':
			return `+${displayNumber((value / SPEED) * 100)} % vitesse`;
		case 'points':
			return `+${displayNumber(value)} points de vol de vie`;
		case 'flat':
			if (definition.stat === 'armor')
				return `+${Math.round(value)} armure`;
			if (definition.stat === 'quantity')
				return `+${Math.round(value)} projectile${value > 1 ? 's' : ''}`;
			return `+${Math.round(value)}`;
		case 'percent':
			if (definition.stat === 'attackDamage')
				return `+${displayNumber(value)} % dégâts`;
			if (definition.stat === 'maxHealth')
				return `+${displayNumber((value / PLAYER_MAX_LIFE) * 100)} % vie max`;
			if (definition.stat === 'range')
				return `+${displayNumber((value / 8) * 100)} % portée`;
			if (definition.stat === 'size')
				return `+${displayNumber(value * 100)} % taille`;
			if (definition.stat === 'duration')
				return `+${displayNumber(value * 100)} % durée`;
			if (definition.stat === 'attackSpeed')
				return `+${displayNumber(value * 100)} % vitesse d'attaque`;
			if (definition.stat === 'luck')
				return `+${displayNumber(value * 100)} % chance de rareté`;
			return `+${displayNumber(value * 100)} %`;
	}
}

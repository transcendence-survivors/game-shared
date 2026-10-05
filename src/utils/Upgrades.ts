import { PLAYER_BASE_RANGE, PLAYER_MAX_LIFE, SPEED } from './Constants';
import type {
	TomeUpgradeDisplayEffect,
	TomeStat,
	TomeId,
	UpgradeDisplayFormat,
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

const TOME_DISPLAY: Readonly<
	Record<
		TomeStat,
		readonly [divisor: number, scale: number, UpgradeDisplayFormat]
	>
> = {
	attackDamage: [1, 1, 'percent'],
	moveSpeed: [SPEED, 100, 'percent'],
	maxHealth: [PLAYER_MAX_LIFE, 100, 'percent'],
	range: [PLAYER_BASE_RANGE, 100, 'percent'],
	attackSpeed: [1, 100, 'percent'],
	size: [1, 100, 'percent'],
	duration: [1, 100, 'percent'],
	luck: [1, 100, 'percent'],
	lifesteal: [1, 1, 'decimal'],
	armor: [1, 1, 'integer'],
	quantity: [1, 1, 'integer'],
	penetration: [1, 1, 'integer'],
};

function tomeDisplayEffect(
	stat: TomeStat,
	value: number,
): TomeUpgradeDisplayEffect {
	const [divisor, scale, format] = TOME_DISPLAY[stat];
	return { source: 'tome', stat, value: (value / divisor) * scale, format };
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

const rarityTier = (
	weight: number,
	valueMultiplier: number,
	weaponStatCount: number,
) => ({ weight, valueMultiplier, weaponStatCount });

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
	common: rarityTier(55, 1, 1),
	uncommon: rarityTier(25, 1.35, 1),
	rare: rarityTier(12, 1.75, 2),
	epic: rarityTier(6, 2.25, 2),
	legendary: rarityTier(2, 3, 3),
};

const tome = (
	id: TomeId,
	stat: TomeStat,
	baseValue: number,
): TomeDefinition => ({
	id,
	stat,
	baseValue,
	maxLevel: TOME_MAX_LEVEL,
	iconUrl: `tome${id[0]!.toUpperCase()}${id.slice(1)}` as UpgradeIcon,
});

export const TOME_DEFINITIONS: readonly TomeDefinition[] = [
	tome('damage', 'attackDamage', 8),
	tome('cooldown', 'attackSpeed', 0.075),
	tome('agility', 'moveSpeed', SPEED * 0.1),
	tome('vitality', 'maxHealth', PLAYER_MAX_LIFE * 0.1),
	tome('armor', 'armor', 1),
	tome('blood', 'lifesteal', 1.5),
	tome('range', 'range', 0.8),
	tome('size', 'size', 0.1),
	tome('duration', 'duration', 0.1),
	tome('quantity', 'quantity', 1),
	tome('fortune', 'luck', 0.07),
];

const trait = (
	stat: WeaponUpgradeStat,
	baseValue: number,
	valueType: WeaponTraitDefinition['valueType'] = 'ratio',
): WeaponTraitDefinition => ({ stat, baseValue, valueType });
const DAMAGE = trait('damageBonus', 0.1);
const ATTACK_RATE = trait('attackRateBonus', 0.08);
const RANGE = trait('rangeBonus', 0.1);
const DURATION = trait('durationBonus', 0.12);
const SIZE = trait('sizeBonus', 0.1);
const PROJECTILE_SPEED = trait('speedBonus', 0.12);
const QUANTITY = trait('quantityBonus', 1, 'integer');
const PENETRATION = trait('penetrationBonus', 1, 'integer');
const KNOCKBACK = trait('knockbackBonus', 0.15);

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

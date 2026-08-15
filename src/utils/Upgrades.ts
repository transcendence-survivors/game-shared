import type { WeaponKind } from './Types';

export type GlobalUpgradeStat =
	| 'attackDamage'
	| 'attackSpeed'
	| 'moveSpeed'
	| 'lifesteal'
	| 'range'
	| 'armor'
	| 'maxHealth';

export type UpgradeEffect =
	| {
			kind: 'global-stat';
			stat: GlobalUpgradeStat;
			operation: 'add' | 'multiply';
			value: number;
			maxStacks: number;
	  }
	| { kind: 'unlock-weapon'; weaponKind: WeaponKind }
	| { kind: 'level-weapon'; weaponKind: WeaponKind };

export interface UpgradeDef {
	id: string;
	name: string;
	description: string;
	iconUrl:
		| 'armor'
		| 'moveSpeed'
		| 'damage'
		| 'attackSpeed'
		| 'lifesteal'
		| 'maxHealth'
		| 'range';
	effect: UpgradeEffect;
}

export const UPGRADE_POOL: UpgradeDef[] = [
	{
		id: 'damage_up',
		name: 'Sword of the Divine',
		description: '+10% damage',
		iconUrl: 'damage',
		effect: {
			kind: 'global-stat',
			stat: 'attackDamage',
			operation: 'multiply',
			value: 1.1,
			maxStacks: 10,
		},
	},
	{
		id: 'attack_speed_up',
		name: 'Artemis Gift',
		description: '+15% attack speed',
		iconUrl: 'attackSpeed',
		effect: {
			kind: 'global-stat',
			stat: 'attackSpeed',
			operation: 'multiply',
			value: 1.15,
			maxStacks: 8,
		},
	},
	{
		id: 'move_speed_up',
		name: 'Hermes Boots',
		description: '+10% move speed',
		iconUrl: 'moveSpeed',
		effect: {
			kind: 'global-stat',
			stat: 'moveSpeed',
			operation: 'multiply',
			value: 1.1,
			maxStacks: 8,
		},
	},
	{
		id: 'lifesteal_up',
		name: 'Blood Hunger',
		description: '+2% lifesteal',
		iconUrl: 'lifesteal',
		effect: {
			kind: 'global-stat',
			stat: 'lifesteal',
			operation: 'add',
			value: 2,
			maxStacks: 10,
		},
	},
	{
		id: 'range_up',
		name: 'Scopier Weapons',
		description: '+2 range',
		iconUrl: 'range',
		effect: {
			kind: 'global-stat',
			stat: 'range',
			operation: 'add',
			value: 2,
			maxStacks: 8,
		},
	},
	{
		id: 'armor_up',
		name: `Athena's blessing`,
		description: '+1 damage reduction',
		iconUrl: 'armor',
		effect: {
			kind: 'global-stat',
			stat: 'armor',
			operation: 'add',
			value: 1,
			maxStacks: 10,
		},
	},
	{
		id: 'max_health_up',
		name: `Prometheus's Gift`,
		description: '+10% max health',
		iconUrl: 'maxHealth',
		effect: {
			kind: 'global-stat',
			stat: 'maxHealth',
			operation: 'multiply',
			value: 1.1,
			maxStacks: 10,
		},
	},
];

const WEAPON_NAMES: Record<WeaponKind, string> = {
	aura: 'Aura',
	sword: 'Épée',
	axe: 'Hache',
	staff: 'Staff',
	bow: 'Arc',
};

export const weaponUpgradeDefinitions = (
	weaponKind: WeaponKind,
	unlocked: boolean,
): UpgradeDef => ({
	id: `${unlocked ? 'level' : 'unlock'}_${weaponKind}`,
	name: unlocked
		? `${WEAPON_NAMES[weaponKind]} niveau supérieur`
		: `Débloquer ${WEAPON_NAMES[weaponKind]}`,
	description: unlocked
		? `Améliore ${WEAPON_NAMES[weaponKind]}`
		: `Ajoute ${WEAPON_NAMES[weaponKind]} à l'arsenal`,
	iconUrl: weaponKind === 'aura' ? 'range' : 'damage',
	effect: unlocked
		? { kind: 'level-weapon', weaponKind }
		: { kind: 'unlock-weapon', weaponKind },
});

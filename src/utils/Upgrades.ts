import type { Player } from '../schemas/GameState';

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
	apply: (player: Player) => void;
}

export const UPGRADE_POOL: UpgradeDef[] = [
	{
		id: 'damage_up',
		name: 'Sword of the Divine',
		description: '+10% damage',
		iconUrl: 'damage',
		apply: (player) => {
			player.stats.attackDamage *= 1.1;
		},
	},
	{
		id: 'attack_speed_up',
		name: 'Artemis Gift',
		description: '+15% attack speed',
		iconUrl: 'attackSpeed',
		apply: (player) => {
			player.stats.attackSpeed *= 1.15;
		},
	},
	{
		id: 'move_speed_up',
		name: 'Hermes Boots',
		description: '+10% move speed',
		iconUrl: 'moveSpeed',
		apply: (player) => {
			player.stats.moveSpeed *= 1.1;
		},
	},
	{
		id: 'lifesteal_up',
		name: 'Blood Thirst',
		description: '+2% lifesteal',
		iconUrl: 'lifesteal',
		apply: (player) => {
			player.stats.lifesteal += 2;
		},
	},
	{
		id: 'range_up',
		name: 'Scopier Weapons',
		description: '+2 range',
		iconUrl: 'range',
		apply: (player) => {
			player.stats.range += 2;
		},
	},
	{
		id: 'armor_up',
		name: `Athena's blessing`,
		description: '+1 damage reduction',
		iconUrl: 'armor',
		apply: (player) => {
			player.stats.armor += 1;
		},
	},
	{
		id: 'max_health_up',
		name: `Prometheus's Gift`,
		description: '+10% max health',
		iconUrl: 'maxHealth',
		apply: (player) => {
			const newMax = (player.stats.maxHealth *= 1.1);
			player.life.rescale(newMax);
		},
	},
];

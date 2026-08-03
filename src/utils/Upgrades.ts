import type { Player } from '../schemas/GameState';

export interface UpgradeDef {
	id: string;
	name: string;
	description: string;
	// iconUrl: string;
	apply: (player: Player) => void;
}

export const UPGRADE_POOL: UpgradeDef[] = [
	{
		id: 'damage_up',
		name: 'SUUUUUU',
		description: '+10% damage',
		apply: (player) => {
			player.stats.attackDamage *= 1.1;
		},
	},
	{
		id: 'attack_speed_up',
		name: 'ATTACK',
		description: '+15% attack speed',
		apply: (player) => {
			player.stats.attackSpeed *= 1.15;
		},
	},
	{
		id: 'move_speed_up',
		name: 'FAST',
		description: '+10% move speed',
		apply: (player) => {
			player.stats.moveSpeed *= 1.1;
		},
	},
	{
		id: 'lifesteal_up',
		name: 'DRACULA',
		description: '+2% lifesteal',
		apply: (player) => {
			player.stats.lifesteal *= 1.2;
		},
	},
	{
		id: 'range_up',
		name: 'LEEEROY',
		description: '+2 range',
		apply: (player) => {
			player.stats.range += 2;
		},
	},
];

import { BOSS_KINDS, MONSTER_KINDS } from './Constants';

export interface Vec3d {
	x: number;
	y: number;
	z: number;
}
export interface Vec2d {
	x: number;
	z: number;
}

export interface MoveInput {
	seq: number;
	forward: boolean;
	backward: boolean;
	right: boolean;
	left: boolean;
	jump: boolean;
	deltaTime: number;
	cameraYaw: number;
}

export interface AttackInput {
	monsterId: string;
}

export interface MonsterDamageEvent {
	id: string;
	x: number;
	y: number;
	z: number;
	amount: number;
	isBoss: boolean;
	fatal: boolean;
}

export type MonsterKind = (typeof MONSTER_KINDS)[number];

export type MonsterAnimState = 'idle' | 'walk' | 'attack';

export type BossKind = (typeof BOSS_KINDS)[number];

export interface StatMultipliers {
	hpMultiplier: number;
	damageMultiplier: number;
}

export interface MonsterStats {
	maxLife: number;
	damage: number;
	xpReward: number;
}

export interface MovementState {
	x: number;
	y: number;
	rotationY: number;
	z: number;
	velocityY: number;
	isGrounded: boolean;
}

export interface HorizontalMove {
	x: number;
	z: number;
	rotationY: number;
}

export interface VerticalMove {
	y: number;
	velocityY: number;
	isGrounded: boolean;
}

export interface PlayerStats {
	health: number;
	attackSpeed: number;
	moveSpeed: number;
	attackDamage: number;
	armor: number;
	luck: number;
	killAmount: number;
}

export interface UpgradeOption {
	id: string;
	name: string;
	description: string;
	iconUrl: string;
}

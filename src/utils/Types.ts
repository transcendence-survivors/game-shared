import {
	BOSS_KINDS,
	COMBAT_ENTITY_KINDS,
	COMBAT_ENTITY_PHASES,
	COMBAT_HITBOX_SHAPES,
	MONSTER_KINDS,
	WEAPON_KINDS,
} from './Constants';

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

export type WeaponKind = (typeof WEAPON_KINDS)[number];

export type CombatEntityKind = (typeof COMBAT_ENTITY_KINDS)[number];

export type CombatEntityPhase = (typeof COMBAT_ENTITY_PHASES)[number];
export type CombatHitboxShape = (typeof COMBAT_HITBOX_SHAPES)[number];

export interface MonsterDamageEvent {
	id: string;
	x: number;
	y: number;
	z: number;
	amount: number;
	isBoss: boolean;
	fatal: boolean;
	sourcePlayerId?: string;
	weaponKind?: WeaponKind;
	combatEntityId?: string;
}

export interface CombatImpactEvent extends MonsterDamageEvent {
	sourcePlayerId: string;
	weaponKind: WeaponKind;
	combatEntityId: string;
}

export interface SelectUpgradeInput {
	id: string;
}

export interface WorldSeedMessage {
	seed: number;
}

export interface GameOverMessage {
	playerId: string;
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

export interface UpgradeOption {
	id: string;
	name: string;
	description: string;
	iconUrl: string;
}

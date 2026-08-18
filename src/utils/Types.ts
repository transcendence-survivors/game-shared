import {
	BOSS_KINDS,
	COMBAT_ENTITY_KINDS,
	COMBAT_HITBOX_SHAPES,
	MONSTER_KINDS,
	UPGRADE_RARITIES,
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

/** Integer coordinates identifying one generated world chunk. */
export interface ChunkCoordinates {
	chunkX: number;
	chunkZ: number;
}

/** Optional direction components accepted when spawning a combat projectile. */
export interface ProjectileDirection {
	directionX?: number;
	directionY?: number;
	directionZ?: number;
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

export type UpgradeRarity = (typeof UPGRADE_RARITIES)[number];

export type UpgradeCategory = 'tome' | 'weapon' | 'unlock';

export type UpgradeIcon =
	| 'tomeDamage'
	| 'tomeCooldown'
	| 'tomeAgility'
	| 'tomeVitality'
	| 'tomeArmor'
	| 'tomeBlood'
	| 'tomeRange'
	| 'tomeSize'
	| 'tomeDuration'
	| 'tomeQuantity'
	| 'tomeFortune'
	| 'weaponAura'
	| 'weaponSword'
	| 'weaponAxe'
	| 'weaponStaff'
	| 'weaponBow';

export type CombatEntityKind = (typeof COMBAT_ENTITY_KINDS)[number];

export type CombatHitboxShape = (typeof COMBAT_HITBOX_SHAPES)[number];

export interface MonsterDamageEvent {
	id: string;
	x: number;
	y: number;
	z: number;
	amount: number;
	isBoss: boolean;
	isElite?: boolean;
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

export type MonsterKind = (typeof MONSTER_KINDS)[number];

export type MonsterAnimState = 'idle' | 'walk' | 'attack';

export type BossKind = (typeof BOSS_KINDS)[number];

export type MonsterRank = 'normal' | 'elite' | 'boss';

export type MonsterRole =
	| 'chaser'
	| 'swarm'
	| 'tank'
	| 'charger'
	| 'ranged'
	| 'bomber'
	| 'summoner'
	| 'boss';

export type MonsterAiKind =
	| 'chaser'
	| 'swarm'
	| 'tank'
	| 'charger'
	| 'ranged'
	| 'bomber'
	| 'summoner'
	| 'boss';

interface MonsterStats {
	maxLife: number;
	damage: number;
	xpReward: number;
}

export interface MonsterRuntimeStats extends MonsterStats {
	moveSpeed: number;
	attackRange: number;
	attackCooldownS: number;
	knockbackResistance: number;
}

export interface MovementState extends Vec3d {
	rotationY: number;
	velocityY: number;
	isGrounded: boolean;
}

export interface MovementBoundary {
	centerX: number;
	centerZ: number;
	radius: number;
}

export interface UpgradeOption {
	id: string;
	name: string;
	description: string;
	iconUrl: UpgradeIcon;
	rarity: UpgradeRarity;
	category: UpgradeCategory;
}

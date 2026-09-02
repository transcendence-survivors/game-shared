import { MapSchema, Schema, type } from '@colyseus/schema';
import { Life } from './Life';
import { Experience } from './Experience';
import {
	COMBAT_HITBOX_SHAPES,
	MONSTER_BASE_DAMAGE,
	MONSTER_BASE_LIFE,
	MONSTER_BASE_XP_REWARD,
	PLAYER_MAX_LIFE,
	PLAYER_AURA_RADIUS,
	PLAYER_AURA_ATTACK_SPEED,
	SPEED,
	WEAPON_KINDS,
} from '../utils/Constants';
import {
	DEFAULT_MONSTER_HITBOX_HEIGHT,
	DEFAULT_MONSTER_HITBOX_OFFSET_X,
	DEFAULT_MONSTER_HITBOX_OFFSET_Y,
	DEFAULT_MONSTER_HITBOX_OFFSET_Z,
	DEFAULT_MONSTER_HITBOX_RADIUS,
} from '../gameplay/MonsterHitboxes';
import {
	type CombatEntityKind,
	type CombatHitboxShape,
	type MonsterAnimState,
	type MonsterRank,
	type WeaponKind,
} from '../utils/Types';

export class WeaponState extends Schema {
	@type('string') kind: WeaponKind = WEAPON_KINDS[0];
	@type('number') level: number = 1;
	@type('number') damageBonus: number = 0;
	@type('number') attackRateBonus: number = 0;
	@type('number') rangeBonus: number = 0;
	@type('number') durationBonus: number = 0;
	@type('number') sizeBonus: number = 0;
	@type('number') speedBonus: number = 0;
	@type('number') quantityBonus: number = 0;
	@type('number') penetrationBonus: number = 0;
	@type('number') knockbackBonus: number = 0;
	activationSequence: number = 0;
}

export class CombatEntity extends Schema {
	id: string = '';
	@type('string') kind: CombatEntityKind = 'sword-slash';
	@type('string') weaponKind: WeaponKind = WEAPON_KINDS[0];
	@type('string') ownerSessionId: string = '';
	targetId: string = '';
	@type('number') x: number = 0;
	@type('number') y: number = 0;
	@type('number') z: number = 0;
	@type('number') directionX: number = 0;
	@type('number') directionY: number = 0;
	@type('number') directionZ: number = 0;
	@type('number') rotationY: number = 0;
	@type('number') scale: number = 1;
	@type('string') hitboxShape: CombatHitboxShape = COMBAT_HITBOX_SHAPES[0];
	@type('number') hitboxRadius: number = 0;
	@type('number') hitboxHeight: number = 0;
	@type('number') hitboxWidth: number = 0;
	@type('number') hitboxDepth: number = 0;
	@type('number') hitboxHalfAngle: number = 0;
	spawnSequence: number = 0;
	expiresAtS: number = 0;
}

export class Aura extends Schema {
	@type('number') radius: number = PLAYER_AURA_RADIUS;
	@type('number') attackSpeed: number = PLAYER_AURA_ATTACK_SPEED;
	@type('number') height: number = 3;
}

export class PlayerStats extends Schema {
	@type('number') maxHealth: number = 100;
	@type('number') attackSpeed: number = 1;
	@type('number') moveSpeed: number = SPEED;
	@type('number') attackDamage: number = 100;
	@type('number') armor: number = 1;
	@type('number') luck: number = 1;
	@type('number') killAmount: number = 0;
	@type('number') lifesteal: number = 1;
	@type('number') range: number = 8;
	@type('number') size: number = 1;
	@type('number') duration: number = 1;
	@type('number') quantity: number = 0;
	@type('number') penetration: number = 0;
	tomeLevels = new Map<string, number>();
}

export class Player extends Schema {
	@type('string') username: string = 'Yoda'; // TODO
	@type('number') id: 1 | 2 | 3 | 4 | null = null;
	@type('number') x: number = 0;
	@type('number') y: number = 0;
	@type('number') z: number = 0;
	@type('number') rotationY: number = 0;
	@type('number') velocityY: number = 0;
	@type('boolean') isGrounded: boolean = true;
	debugImmortal: boolean = false;
	@type('number') lastProcessedSeq: number = 0;
	@type('string') animState: 'idle' | 'moving' = 'idle';
	@type(PlayerStats) stats = new PlayerStats();
	@type(Life) life = new Life(PLAYER_MAX_LIFE);
	@type(Experience) experience = new Experience();
	@type(Aura) aura = new Aura();
	auraCooldownS = 0;
	@type('boolean') ready: boolean = false;
	@type({ map: WeaponState }) weapons = new MapSchema<WeaponState>();
}

export class Monster extends Schema {
	@type('string') kind: string = '';
	@type('boolean') isBoss: boolean = false;
	@type('boolean') isElite: boolean = false;
	@type('string') rank: MonsterRank = 'normal';
	@type('number') x: number = 0;
	y: number = 0;
	@type('number') z: number = 0;
	@type('number') rotationY: number = 0;
	damage: number = MONSTER_BASE_DAMAGE;
	xpReward: number = MONSTER_BASE_XP_REWARD;
	hitboxRadius: number = DEFAULT_MONSTER_HITBOX_RADIUS;
	hitboxHeight: number = DEFAULT_MONSTER_HITBOX_HEIGHT;
	hitboxOffsetX: number = DEFAULT_MONSTER_HITBOX_OFFSET_X;
	hitboxOffsetY: number = DEFAULT_MONSTER_HITBOX_OFFSET_Y;
	hitboxOffsetZ: number = DEFAULT_MONSTER_HITBOX_OFFSET_Z;
	@type('string') animState: MonsterAnimState = 'idle';
	@type('number') animStartedAtS: number = 0;
	@type(Life) life = new Life(MONSTER_BASE_LIFE);
	sizeMultiplier = 1;
	knockbackResistance = 0;
	hpMultiplier = 1;
	damageMultiplier = 1;
	attackCooldownS = 0;
}

export class GameState extends Schema {
	@type({ map: Player }) players = new MapSchema<Player>();
	@type({ map: Monster }) monsters = new MapSchema<Monster>();
	@type({ map: CombatEntity }) combatEntities = new MapSchema<CombatEntity>();
	@type('string') nextBossKind: string = '';
	@type('number') rayX: number = 0;
	@type('number') rayY: number = 0;
	@type('number') rayZ: number = 0;
	@type('boolean') started: boolean = false;
	seed: number = 0;
	@type('number') combatTimeS: number = 0;
}

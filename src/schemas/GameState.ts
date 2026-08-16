import { MapSchema, Schema, type } from '@colyseus/schema';
import { Life } from './Life';
import { Experience } from './Experience';
import {
	COMBAT_ENTITY_PHASES,
	COMBAT_HITBOX_SHAPES,
	MONSTER_BASE_DAMAGE,
	MONSTER_BASE_LIFE,
	MONSTER_BASE_XP_REWARD,
	PLAYER_MAX_LIFE,
	PLAYER_AURA_RADIUS,
	PLAYER_AURA_DAMAGE,
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
	type CombatEntityPhase,
	type CombatHitboxShape,
	type MonsterAnimState,
	type WeaponKind,
} from '../utils/Types';

export class WeaponState extends Schema {
	@type('string') kind: WeaponKind = WEAPON_KINDS[0];
	@type('number') level: number = 1;
	@type('number') activationSequence: number = 0;
}

export class CombatEntity extends Schema {
	@type('string') id: string = '';
	@type('string') kind: CombatEntityKind = 'sword-slash';
	@type('string') weaponKind: WeaponKind = WEAPON_KINDS[0];
	@type('string') ownerSessionId: string = '';
	@type('string') targetId: string = '';
	@type('string') volleyId: string = '';
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
	@type('string') phase: CombatEntityPhase = COMBAT_ENTITY_PHASES[0];
	@type('number') spawnSequence: number = 0;
	@type('number') createdAtS: number = 0;
	@type('number') phaseStartedAtS: number = 0;
	@type('number') expiresAtS: number = 0;
}

export class Aura extends Schema {
	@type('number') radius: number = PLAYER_AURA_RADIUS;
	@type('number') damage: number = PLAYER_AURA_DAMAGE;
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
	upgradeStacks = new Map<string, number>();
}

export class Player extends Schema {
	@type('number') x: number = 0;
	@type('number') y: number = 0;
	@type('number') z: number = 0;
	@type('number') rotationY: number = 0;
	@type('number') velocityY: number = 0;
	@type('boolean') isGrounded: boolean = true;
	@type('boolean') debugImmortal: boolean = false;
	@type('number') lastProcessedSeq: number = 0;
	@type('string') animState: 'idle' | 'moving' = 'idle';
	@type(PlayerStats) stats = new PlayerStats();
	@type(Life) life = new Life(PLAYER_MAX_LIFE);
	@type(Experience) experience = new Experience();
	@type(Aura) aura = new Aura();
	@type({ map: WeaponState }) weapons = new MapSchema<WeaponState>();
	auraCooldownS = 0;
}

export class Monster extends Schema {
	@type('string') kind: string = '';
	@type('boolean') isBoss: boolean = false;
	@type('number') x: number = 0;
	@type('number') y: number = 0;
	@type('number') z: number = 0;
	@type('number') rotationY: number = 0;
	@type('number') damage: number = MONSTER_BASE_DAMAGE;
	@type('number') xpReward: number = MONSTER_BASE_XP_REWARD;
	@type('number') hitboxRadius: number = DEFAULT_MONSTER_HITBOX_RADIUS;
	@type('number') hitboxHeight: number = DEFAULT_MONSTER_HITBOX_HEIGHT;
	@type('number') hitboxOffsetX: number = DEFAULT_MONSTER_HITBOX_OFFSET_X;
	@type('number') hitboxOffsetY: number = DEFAULT_MONSTER_HITBOX_OFFSET_Y;
	@type('number') hitboxOffsetZ: number = DEFAULT_MONSTER_HITBOX_OFFSET_Z;
	@type('string') animState: MonsterAnimState = 'idle';
	@type(Life) life = new Life(MONSTER_BASE_LIFE);
	hpMultiplier = 1;
	damageMultiplier = 1;
	attackCooldownS = 0;
}

export class GameState extends Schema {
	@type({ map: Player }) players = new MapSchema<Player>();
	@type({ map: Monster }) monsters = new MapSchema<Monster>();
	@type({ map: CombatEntity }) combatEntities = new MapSchema<CombatEntity>();
	@type('number') rayX: number = 0;
	@type('number') rayY: number = 0;
	@type('number') rayZ: number = 0;
	@type('number') seed: number = 0;
	@type('number') combatTimeS: number = 0;
}

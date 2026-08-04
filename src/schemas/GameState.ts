import { MapSchema, Schema, type } from '@colyseus/schema';
import { Life } from './Life';
import { Experience } from './Experience';
import {
	MONSTER_BASE_DAMAGE,
	MONSTER_BASE_LIFE,
	MONSTER_BASE_XP_REWARD,
	PLAYER_MAX_LIFE,
	PLAYER_AURA_RADIUS,
	PLAYER_AURA_DAMAGE,
	PLAYER_AURA_ATTACK_SPEED,
	SPEED,
} from '../utils/Constants';
import { type MonsterAnimState } from '../utils/Types';

export class Aura extends Schema {
	@type('number') radius: number = PLAYER_AURA_RADIUS;
	@type('number') damage: number = PLAYER_AURA_DAMAGE;
	@type('number') attackSpeed: number = PLAYER_AURA_ATTACK_SPEED;
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
}

export class Player extends Schema {
	@type('number') x: number = 0;
	@type('number') y: number = 0;
	@type('number') z: number = 0;
	@type('number') rotationY: number = 0;
	@type('number') velocityY: number = 0;
	@type('boolean') isGrounded: boolean = true;
	@type('number') lastProcessedSeq: number = 0;
	@type('string') animState: 'idle' | 'moving' = 'idle';
	@type(PlayerStats) stats = new PlayerStats();
	@type(Life) life = new Life(PLAYER_MAX_LIFE);
	@type(Experience) experience = new Experience();
	@type(Aura) aura = new Aura();
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
	@type('string') animState: MonsterAnimState = 'idle';
	@type(Life) life = new Life(MONSTER_BASE_LIFE);
	hpMultiplier = 1;
	damageMultiplier = 1;
	attackCooldownS = 0;
}

export class GameState extends Schema {
	@type({ map: Player }) players = new MapSchema<Player>();
	@type({ map: Monster }) monsters = new MapSchema<Monster>();
	@type('number') rayX: number = 0;
	@type('number') rayY: number = 0;
	@type('number') rayZ: number = 0;
	@type('number') seed: number = 0;
}

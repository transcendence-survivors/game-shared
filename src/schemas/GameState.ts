import { MapSchema, Schema, type } from '@colyseus/schema';
import { Life } from './Life';
import { Experience } from './Experience';
import {
	MONSTER_BASE_DAMAGE,
	MONSTER_BASE_LIFE,
	MONSTER_BASE_XP_REWARD,
	PLAYER_MAX_LIFE,
} from '../utils/Constants';

export class Player extends Schema {
	@type('number') x: number = 0;
	@type('number') y: number = 0;
	@type('number') z: number = 0;
	@type('number') rotationY: number = 0;
	@type('number') velocityY: number = 0;
	@type('boolean') isGrounded: boolean = true;
	@type('number') lastProcessedSeq: number = 0;
	@type('string') animState: 'idle' | 'moving' = 'idle';
	@type(Life) life = new Life(PLAYER_MAX_LIFE);
	@type(Experience) experience = new Experience();
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
	@type(Life) life = new Life(MONSTER_BASE_LIFE);
	// Server-side only (not synchronized): share of the 500% stat budget,
	// re-rolled by the MonsterManager at every rotation.
	hpMultiplier = 1;
	damageMultiplier = 1;
}

export class GameState extends Schema {
	@type({ map: Player }) players = new MapSchema<Player>();
	@type({ map: Monster }) monsters = new MapSchema<Monster>();
	@type('number') rayX: number = 0;
	@type('number') rayY: number = 0;
	@type('number') rayZ: number = 0;
	@type('number') seed: number = 0;
}

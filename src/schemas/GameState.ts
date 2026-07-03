import { MapSchema, Schema, type } from '@colyseus/schema';

export class Player extends Schema {
	@type('number') x: number = 0;
	@type('number') y: number = 0;
	@type('number') z: number = 0;
	@type('number') rotationY: number = 0;
	@type('number') velocityY: number = 0;
	@type('boolean') isGrounded: boolean = true;
	@type('number') lastProcessedSeq: number = 0;
	@type('string') animState: 'idle' | 'moving' = 'idle';
	// @type('number') health: number = 100;
	// @type('number') xp: number = 0;
	// @type('number') maxHealth: number = 100;
}

export class GameState extends Schema {
	@type({ map: Player }) players = new MapSchema<Player>();
	@type('number') rayX: number = 0;
	@type('number') rayY: number = 0;
	@type('number') rayZ: number = 0;
	@type('number') seed: number = 0;
}

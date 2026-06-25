import { MapSchema, Schema, type } from '@colyseus/schema';

export const MAX_DT = 0.1;
export const SPEED = 0.1;
export const ROTATION_SPEED = 0.05;

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
	deltaTime: number;
}

export interface MovementState {
	x: number;
	rotationY: number;
	z: number;
}

export class Player extends Schema {
	@type('number') x: number = 0;
	@type('number') y: number = 0;
	@type('number') z: number = 0;
	@type('number') rotationY: number = 0;
	@type('number') lastProcessedSeq: number = 0;
	@type('string') animState: 'idle' | 'moving' = 'idle';
}

export class GameState extends Schema {
	@type({ map: Player }) players = new MapSchema<Player>();
}

export function getForwardVector(rotationY: number): Vec2d {
	return { x: Math.sin(rotationY), z: Math.cos(rotationY) };
}

export function applyMovement(
	state: MovementState,
	input: MoveInput,
): MovementState {
	let { x, z, rotationY } = state;
	if (input.right) rotationY += ROTATION_SPEED;
	if (input.left) rotationY -= ROTATION_SPEED;
	let deltaZ = 0;
	if (input.forward) deltaZ += SPEED;
	if (input.backward) deltaZ -= SPEED;
	if (deltaZ !== 0) {
		const forward = getForwardVector(rotationY);
		x += forward.x * deltaZ;
		z += forward.z * deltaZ;
	}
	return { x, z, rotationY };
}

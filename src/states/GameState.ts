import type { Vector3 } from '@babylonjs/core';
import { MapSchema, Schema, type } from '@colyseus/schema';

export const MAX_DT = 0.1;
export const SPEED = 0.5;
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
	cameraYaw: number;
}

export interface MovementState {
	x: number;
	rotationY: number;
	z: number;
}

export const SUN_H = 150;
export const ACCESS_RADIUS = 128;
export const RAY_SPEED = 1;
export const RAY_DIR_X = 0;
export const RAY_DIR_Z = 1;

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
	@type('number') rayX: number = 0;
	@type('number') rayY: number = 0;
	@type('number') rayZ: number = 0;
}

export function getForwardVector(rotationY: number): Vec2d {
	return { x: Math.sin(rotationY), z: Math.cos(rotationY) };
}

export function getCameraYaw(cameraForward) {
	cameraForward.y = 0;
	cameraForward.normalize();
	return Math.atan2(cameraForward.x, cameraForward.z);
}

export function applyMovement(
	state: MovementState,
	input: MoveInput,
	cameraYaw: number,
): MovementState {
	let { x, z, rotationY } = state;
	const hasMoveInput =
		input.forward || input.backward || input.left || input.right;

	if (hasMoveInput) {
		const forward = getForwardVector(cameraYaw);
		const right = getForwardVector(cameraYaw + Math.PI / 2);
		let moveX = 0;
		let moveZ = 0;
		if (input.forward) {
			moveX += forward.x;
			moveZ += forward.z;
		}
		if (input.backward) {
			moveX -= forward.x;
			moveZ -= forward.z;
		}
		if (input.right) {
			moveX += right.x;
			moveZ += right.z;
		}
		if (input.left) {
			moveX -= right.x;
			moveZ -= right.z;
		}
		const len = Math.hypot(moveX, moveZ);
		if (len > 0) {
			moveX /= len;
			moveZ /= len;

			x += moveX * SPEED;
			z += moveZ * SPEED;
			rotationY = Math.atan2(moveX, moveZ);
		}
	}

	return { x, z, rotationY };
}

export function clampToRadius(
	px: number,
	pz: number,
	cx: number,
	cz: number,
	radius: number,
): { x: number; z: number } {
	const dx = px - cx,
		dz = pz - cz;
	const dist = Math.hypot(dx, dz);
	if (dist <= radius) return { x: px, z: pz };
	const k = radius / dist;
	return { x: cx + dx * k, z: cz + dz * k };
}

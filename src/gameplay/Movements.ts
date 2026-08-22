import {
	type MovementBoundary,
	type MovementState,
	type MoveInput,
	type Vec3d,
} from '../utils/Types';
import { JUMP_SPEED, MAX_DT, GRAVITY } from '../utils/Constants';
import type { World } from '../world/World';
import { clampPositionToCircle, resolveTerrainCollision } from './Collisions';

export function createMoveInput(): MoveInput {
	return {
		seq: 0,
		forward: false,
		backward: false,
		right: false,
		left: false,
		jump: false,
		deltaTime: 0,
		cameraYaw: 0,
	};
}

export function createMovementState(x = 0, y = 0, z = 0): MovementState {
	return {
		x,
		y,
		z,
		rotationY: 0,
		velocityY: 0,
		isGrounded: true,
	};
}

export function getCameraYaw(cameraForward: Pick<Vec3d, 'x' | 'z'>) {
	return Math.atan2(cameraForward.x, cameraForward.z);
}

export function simulatePlayerMovement(
	world: World,
	state: MovementState,
	input: MoveInput,
	speed: number,
	output: MovementState = { ...state },
	boundary?: MovementBoundary,
): MovementState {
	let x = state.x;
	let z = state.z;
	let rotationY = state.rotationY;
	if (input.forward || input.backward || input.left || input.right) {
		const sin = Math.sin(input.cameraYaw);
		const cos = Math.cos(input.cameraYaw);
		const rightX = Math.sin(input.cameraYaw + Math.PI / 2);
		const rightZ = Math.cos(input.cameraYaw + Math.PI / 2);
		let moveX = 0;
		let moveZ = 0;
		if (input.forward) {
			moveX += sin;
			moveZ += cos;
		}
		if (input.backward) {
			moveX -= sin;
			moveZ -= cos;
		}
		if (input.right) {
			moveX += rightX;
			moveZ += rightZ;
		}
		if (input.left) {
			moveX -= rightX;
			moveZ -= rightZ;
		}
		const length = Math.hypot(moveX, moveZ);
		if (length > 0) {
			moveX /= length;
			moveZ /= length;
			const dt = Math.min(input.deltaTime, MAX_DT);
			x += moveX * speed * dt;
			z += moveZ * speed * dt;
			rotationY = Math.atan2(moveX, moveZ);
		}
	}
	resolveTerrainCollision(world, state, x, z, state.y, output);
	if (boundary)
		clampPositionToCircle(
			output,
			boundary.centerX,
			boundary.centerZ,
			boundary.radius,
		);
	x = output.x;
	z = output.z;
	const dt = Math.min(input.deltaTime, MAX_DT);
	let y = state.y;
	let velocityY = state.velocityY;
	let isGrounded = state.isGrounded;
	if (isGrounded && input.jump) {
		velocityY = JUMP_SPEED;
		isGrounded = false;
	}
	if (!isGrounded) {
		// Exact constant-acceleration integration is invariant to packet batching:
		// one 30 Hz server step now matches two 60 Hz prediction steps.
		y += velocityY * dt - 0.5 * GRAVITY * dt * dt;
		velocityY -= GRAVITY * dt;
	}
	const groundHeight = world.height(x, z);
	if (world.isSmoothTerrain && isGrounded) {
		// Follow the continuous slope while walking instead of leaving a small
		// gap when the player moves between terrain samples.
		y = groundHeight;
		velocityY = 0;
	} else if (y <= groundHeight) {
		y = groundHeight;
		velocityY = 0;
		isGrounded = true;
	} else if (isGrounded && y > groundHeight + 0.01) isGrounded = false;
	output.x = x;
	output.y = y;
	output.z = z;
	output.rotationY = rotationY;
	output.velocityY = velocityY;
	output.isGrounded = isGrounded;
	return output;
}

import {
	type MovementState,
	type MoveInput,
	type Vec2d,
	type Vec3d,
} from '../utils/Types';
import { JUMP_SPEED, MAX_DT, GRAVITY } from '../utils/Constants';
import type { World } from '../world/World';
import { resolveTerrainCollision } from './Collisions';

function getForwardVector(rotationY: number): Vec2d {
	return { x: Math.sin(rotationY), z: Math.cos(rotationY) };
}

export function getCameraYaw(cameraForward: Pick<Vec3d, 'x' | 'z'>) {
	return Math.atan2(cameraForward.x, cameraForward.z);
}

export function applyHorizontalMovement(
	state: MovementState,
	input: MoveInput,
	cameraYaw: number,
	speed: number,
): { x: number; z: number; rotationY: number } {
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

			const dt = Math.min(input.deltaTime, MAX_DT);
			x += moveX * speed * dt;
			z += moveZ * speed * dt;
			rotationY = Math.atan2(moveX, moveZ);
		}
	}
	return { x, z, rotationY };
}

export function applyVerticalMovement(
	y: number,
	velocityY: number,
	isGrounded: boolean,
	groundHeight: number,
	input: MoveInput,
): { y: number; velocityY: number; isGrounded: boolean } {
	const dt = Math.min(input.deltaTime, MAX_DT);
	if (isGrounded && input.jump) {
		velocityY = JUMP_SPEED;
		isGrounded = false;
	}
	if (!isGrounded) {
		velocityY -= GRAVITY * dt;
	}
	y += velocityY * dt;
	if (y <= groundHeight) {
		y = groundHeight;
		velocityY = 0;
		isGrounded = true;
	} else if (isGrounded && y > groundHeight + 0.01) isGrounded = false;
	return { y, velocityY, isGrounded };
}

export function simulatePlayerMovement(
	world: World,
	state: MovementState,
	input: MoveInput,
	speed: number,
): MovementState {
	const horizontal = applyHorizontalMovement(
		state,
		input,
		input.cameraYaw,
		speed,
	);
	const resolved = resolveTerrainCollision(
		world,
		state,
		horizontal,
		state.y,
	);
	const vertical = applyVerticalMovement(
		state.y,
		state.velocityY,
		state.isGrounded,
		world.height(resolved.x, resolved.z),
		input,
	);
	return {
		x: resolved.x,
		y: vertical.y,
		z: resolved.z,
		rotationY: horizontal.rotationY,
		velocityY: vertical.velocityY,
		isGrounded: vertical.isGrounded,
	};
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

export function isInsideRay(
	px: number,
	pz: number,
	rayCenter: { x: number; z: number },
	radius: number,
): boolean {
	const dx = px - rayCenter.x;
	const dz = pz - rayCenter.z;
	return dx * dx + dz * dz <= radius * radius;
}

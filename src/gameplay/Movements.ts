import * as BABYLON from '@babylonjs/core';
import { type MovementState, type MoveInput, type Vec2d } from '../utils/Types';
import { SPEED, JUMP_SPEED, MAX_DT, GRAVITY } from '../utils/Constants';

function getForwardVector(rotationY: number): Vec2d {
	return { x: Math.sin(rotationY), z: Math.cos(rotationY) };
}

export function getCameraYaw(cameraForward: BABYLON.Vector3) {
	cameraForward.y = 0;
	cameraForward.normalize();
	return Math.atan2(cameraForward.x, cameraForward.z);
}

export function applyHorizontalMovement(
	state: MovementState,
	input: MoveInput,
	cameraYaw: number,
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
			x += moveX * SPEED * dt;
			z += moveZ * SPEED * dt;
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

import type { Vec2d } from '../utils/Types';

export function distanceSquared(a: Vec2d, b: Vec2d): number {
	const dx = b.x - a.x;
	const dz = b.z - a.z;
	return dx * dx + dz * dz;
}

export function normalizeAngle(angle: number): number {
	return Math.atan2(Math.sin(angle), Math.cos(angle));
}

export function forwardVector(rotationY: number, result?: Vec2d): Vec2d {
	const forward = result ?? { x: 0, z: 0 };
	forward.x = Math.sin(rotationY);
	forward.z = Math.cos(rotationY);
	return forward;
}

export function isCircleInSector(
	target: Vec2d,
	targetRadius: number,
	origin: Vec2d,
	rotationY: number,
	range: number,
	halfAngle: number,
): boolean {
	if (
		!Number.isFinite(targetRadius) ||
		!Number.isFinite(rotationY) ||
		!Number.isFinite(range) ||
		!Number.isFinite(halfAngle) ||
		targetRadius < 0 ||
		range < 0 ||
		halfAngle < 0
	)
		return false;
	const dx = target.x - origin.x;
	const dz = target.z - origin.z;
	const distance = Math.hypot(dx, dz);
	if (distance > range + targetRadius) return false;
	if (distance <= targetRadius) return true;
	const targetAngle = Math.atan2(dx, dz);
	const angularRadius = Math.asin(Math.min(1, targetRadius / distance));
	return (
		Math.abs(normalizeAngle(targetAngle - rotationY)) <=
		halfAngle + angularRadius
	);
}

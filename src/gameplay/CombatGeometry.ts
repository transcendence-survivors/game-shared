import type { Vec2d } from '../utils/Types';

export function distanceSquared(a: Vec2d, b: Vec2d): number {
	const dx = b.x - a.x;
	const dz = b.z - a.z;
	return dx * dx + dz * dz;
}

export function normalizeAngle(angle: number): number {
	return Math.atan2(Math.sin(angle), Math.cos(angle));
}

export function rotateVector(vector: Vec2d, angle: number): Vec2d {
	const sin = Math.sin(angle);
	const cos = Math.cos(angle);
	return {
		x: vector.x * cos + vector.z * sin,
		z: vector.z * cos - vector.x * sin,
	};
}

export function forwardVector(rotationY: number): Vec2d {
	return { x: Math.sin(rotationY), z: Math.cos(rotationY) };
}

export function isPointInCircle(
	point: Vec2d,
	center: Vec2d,
	radius: number,
): boolean {
	if (!Number.isFinite(radius) || radius < 0) return false;
	return distanceSquared(point, center) <= radius * radius;
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
		![targetRadius, rotationY, range, halfAngle].every(Number.isFinite) ||
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

export function distanceSquaredToSegment(
	point: Vec2d,
	start: Vec2d,
	end: Vec2d,
): number {
	const segmentX = end.x - start.x;
	const segmentZ = end.z - start.z;
	const lengthSquared = segmentX * segmentX + segmentZ * segmentZ;
	if (lengthSquared === 0) return distanceSquared(point, start);
	const projection = Math.min(
		1,
		Math.max(
			0,
			((point.x - start.x) * segmentX +
				(point.z - start.z) * segmentZ) /
				lengthSquared,
		),
	);
	const closest = {
		x: start.x + segmentX * projection,
		z: start.z + segmentZ * projection,
	};
	return distanceSquared(point, closest);
}

export function doesMovingCircleHitCircle(
	start: Vec2d,
	end: Vec2d,
	movingRadius: number,
	target: Vec2d,
	targetRadius: number,
): boolean {
	if (
		![movingRadius, targetRadius].every(Number.isFinite) ||
		movingRadius < 0 ||
		targetRadius < 0
	)
		return false;
	const combinedRadius = movingRadius + targetRadius;
	return (
		distanceSquaredToSegment(target, start, end) <=
		combinedRadius * combinedRadius
	);
}

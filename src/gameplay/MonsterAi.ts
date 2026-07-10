import { type Vec2d } from '../utils/Types';

export interface ChaseStep {
	x: number;
	z: number;
	rotationY: number;
	inRange: boolean;
}

/** Index of the point closest to `from`, or -1 when `points` is empty. */
export function nearestIndex(from: Vec2d, points: readonly Vec2d[]): number {
	let best = -1;
	let bestDistSq = Infinity;
	for (let i = 0; i < points.length; i++) {
		const dx = points[i].x - from.x;
		const dz = points[i].z - from.z;
		const distSq = dx * dx + dz * dz;
		if (distSq < bestDistSq) {
			bestDistSq = distSq;
			best = i;
		}
	}
	return best;
}

/**
 * Advances one step of `speed * dtSeconds` from `from` toward `target`,
 * never moving closer than `stopDistance`. The step always faces the
 * target; `inRange` is true once `from` is within `stopDistance`.
 */
export function chaseStep(
	from: Vec2d,
	target: Vec2d,
	speed: number,
	dtSeconds: number,
	stopDistance: number,
): ChaseStep {
	const dx = target.x - from.x;
	const dz = target.z - from.z;
	const distance = Math.hypot(dx, dz);
	const rotationY = distance > 0 ? Math.atan2(dx, dz) : 0;
	if (distance <= stopDistance) {
		return { x: from.x, z: from.z, rotationY, inRange: true };
	}
	if (!Number.isFinite(speed) || !Number.isFinite(dtSeconds)) {
		return { x: from.x, z: from.z, rotationY, inRange: false };
	}
	const step = Math.min(
		Math.max(0, speed * dtSeconds),
		distance - stopDistance,
	);
	return {
		x: from.x + (dx / distance) * step,
		z: from.z + (dz / distance) * step,
		rotationY,
		inRange: distance - step <= stopDistance,
	};
}

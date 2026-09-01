import { type Vec2d } from '../utils/Types';

export interface ChaseStep extends Vec2d {
	rotationY: number;
	inRange: boolean;
}

export function chaseStep(
	from: Vec2d,
	target: Vec2d,
	speed: number,
	dtSeconds: number,
	stopDistance: number,
	output: ChaseStep = { x: 0, z: 0, rotationY: 0, inRange: false },
): ChaseStep {
	const dx = target.x - from.x;
	const dz = target.z - from.z;
	const distance = Math.hypot(dx, dz);
	const rotationY = distance > 0 ? Math.atan2(dx, dz) : 0;
	output.x = from.x;
	output.z = from.z;
	output.rotationY = rotationY;
	output.inRange = distance <= stopDistance;
	if (distance <= stopDistance) {
		return output;
	}
	if (!Number.isFinite(speed) || !Number.isFinite(dtSeconds)) {
		return output;
	}
	const step = Math.min(
		Math.max(0, speed * dtSeconds),
		distance - stopDistance,
	);
	output.x = from.x + (dx / distance) * step;
	output.z = from.z + (dz / distance) * step;
	output.inRange = distance - step <= stopDistance;
	return output;
}

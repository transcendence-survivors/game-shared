import { describe, expect, it } from 'vitest';
import {
	doesMovingCircleHitCircle,
	forwardVector,
	isCircleInSector,
	isPointInCircle,
	normalizeAngle,
	rotateVector,
} from './CombatGeometry';

describe('CombatGeometry', () => {
	it('includes points on a circle boundary', () => {
		expect(isPointInCircle({ x: 3, z: 4 }, { x: 0, z: 0 }, 5)).toBe(
			true,
		);
	});

	it('normalizes angles around pi', () => {
		expect(normalizeAngle(Math.PI * 3)).toBeCloseTo(Math.PI);
		expect(normalizeAngle(-Math.PI * 3)).toBeCloseTo(-Math.PI);
	});

	it('builds and rotates forward vectors', () => {
		expect(forwardVector(0)).toEqual({ x: 0, z: 1 });
		const rotated = rotateVector({ x: 0, z: 1 }, Math.PI / 2);
		expect(rotated.x).toBeCloseTo(1);
		expect(rotated.z).toBeCloseTo(0);
	});

	it('accepts targets in front and rejects targets behind', () => {
		expect(
			isCircleInSector(
				{ x: 0, z: 4 },
				0.5,
				{ x: 0, z: 0 },
				0,
				4.5,
				Math.PI / 4,
			),
		).toBe(true);
		expect(
			isCircleInSector(
				{ x: 0, z: -1 },
				0.5,
				{ x: 0, z: 0 },
				0,
				4.5,
				Math.PI / 4,
			),
		).toBe(false);
	});

	it('detects swept projectile collisions', () => {
		expect(
			doesMovingCircleHitCircle(
				{ x: 0, z: 0 },
				{ x: 10, z: 0 },
				0.25,
				{ x: 5, z: 0.5 },
				0.25,
			),
		).toBe(true);
		expect(
			doesMovingCircleHitCircle(
				{ x: 0, z: 0 },
				{ x: 10, z: 0 },
				0.25,
				{ x: 5, z: 1 },
				0.25,
			),
		).toBe(false);
	});
});

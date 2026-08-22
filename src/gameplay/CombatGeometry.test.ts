import { describe, expect, it } from 'vitest';
import {
	forwardVector,
	isCircleInSector,
	normalizeAngle,
} from './CombatGeometry';

describe('CombatGeometry', () => {
	it('normalizes angles around pi', () => {
		expect(normalizeAngle(Math.PI * 3)).toBeCloseTo(Math.PI);
		expect(normalizeAngle(-Math.PI * 3)).toBeCloseTo(-Math.PI);
	});

	it('builds forward vectors in a reusable output', () => {
		expect(forwardVector(0)).toEqual({ x: 0, z: 1 });
		const result = { x: 5, z: 5 };
		expect(forwardVector(Math.PI / 2, result)).toBe(result);
		expect(result.x).toBeCloseTo(1);
		expect(result.z).toBeCloseTo(0);
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
});

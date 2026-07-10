import { describe, expect, it } from 'vitest';
import { chaseStep, nearestIndex } from './MonsterAi';

describe('nearestIndex', () => {
	it('returns -1 when there is no point', () => {
		expect(nearestIndex({ x: 0, z: 0 }, [])).toBe(-1);
	});

	it('returns the index of the closest point', () => {
		const points = [
			{ x: 10, z: 0 },
			{ x: 3, z: 4 },
			{ x: -2, z: -2 },
		];
		expect(nearestIndex({ x: 0, z: 0 }, points)).toBe(2);
	});
});

describe('chaseStep', () => {
	it('moves toward the target at the given speed', () => {
		const step = chaseStep({ x: 0, z: 0 }, { x: 0, z: 10 }, 2, 1, 1);
		expect(step.x).toBeCloseTo(0);
		expect(step.z).toBeCloseTo(2);
		expect(step.inRange).toBe(false);
	});

	it('never moves closer than the stop distance', () => {
		const step = chaseStep({ x: 0, z: 0 }, { x: 0, z: 10 }, 100, 1, 3);
		expect(step.z).toBeCloseTo(7);
		expect(step.inRange).toBe(true);
	});

	it('stands still and reports inRange within the stop distance', () => {
		const step = chaseStep({ x: 0, z: 2 }, { x: 0, z: 4 }, 5, 1, 3);
		expect(step.x).toBe(0);
		expect(step.z).toBe(2);
		expect(step.inRange).toBe(true);
	});

	it('faces the target', () => {
		const step = chaseStep({ x: 0, z: 0 }, { x: 5, z: 0 }, 1, 0.1, 1);
		expect(step.rotationY).toBeCloseTo(Math.PI / 2);
	});

	it('ignores invalid deltas', () => {
		const step = chaseStep({ x: 0, z: 0 }, { x: 0, z: 10 }, 2, NaN, 1);
		expect(step.z).toBe(0);
		expect(step.inRange).toBe(false);
	});
});

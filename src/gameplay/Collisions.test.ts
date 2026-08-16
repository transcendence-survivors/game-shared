import { describe, expect, test } from 'vitest';
import type { World } from '../world/World';
import { resolveTerrainCollision } from './Collisions';

function testWorld(height: (x: number, z: number) => number): World {
	return { CELL: 12, height } as World;
}

describe('terrain collision recovery', () => {
	test('extracts a player whose radius is already embedded in a wall', () => {
		const world = testWorld((x) => (x >= 12 ? 10 : 0));
		const resolved = resolveTerrainCollision(
			world,
			{ x: 11.6, z: 6 },
			{ x: 11.5, z: 6 },
			0,
		);
		expect(resolved.x).toBeLessThan(11.5);
		expect(resolved.x).toBeCloseTo(11.39);
		expect(resolved.z).toBe(6);
	});

	test('detects diagonal wall corners and slides along their free axis', () => {
		const world = testWorld((x, z) => (x >= 12 && z >= 12 ? 10 : 0));
		const resolved = resolveTerrainCollision(
			world,
			{ x: 10, z: 10 },
			{ x: 11.7, z: 11.7 },
			0,
		);
		expect(resolved).toEqual({ x: 11.7, z: 10 });
	});

	test('does not alter unobstructed movement', () => {
		const world = testWorld(() => 0);
		expect(
			resolveTerrainCollision(world, { x: 2, z: 3 }, { x: 4, z: 5 }, 0),
		).toEqual({ x: 4, z: 5 });
	});
});

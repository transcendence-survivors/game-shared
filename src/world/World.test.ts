import { describe, expect, test } from 'vitest';
import { World } from './World';

describe('World', () => {
	test('keeps terrain metadata and smooth heights deterministic', () => {
		const world = new World(987654321);
		let tier = 0;
		let ramp = 0;
		let height = 0;
		let color = 0;
		let index = 0;
		for (let z = -20; z <= 20; z++)
			for (let x = -20; x <= 20; x++, index++) {
				const level = world.tier(x, z);
				const direction = world.rampDir(x, z);
				const tint = world.topColor(level);
				tier += level * ((index % 19) + 1);
				ramp +=
					(direction ? direction[0] * 3 + direction[1] * 5 : 0) *
					((index % 23) + 1);
				height +=
					world.height(x * world.CELL + 3.25, z * world.CELL + 7.75) *
					((index % 29) + 1);
				color +=
					(tint.r + tint.g * 3 + tint.b * 7) * ((index % 31) + 1);
		}
		expect({ tier, ramp }).toEqual({ tier: 63075, ramp: -3749 });
		expect(height).toBeGreaterThan(0);
		expect(color).toBeCloseTo(130842.65161904738);
		expect(world.height(0, 0)).toBe(new World(987654321).height(0, 0));
		expect(Math.abs(world.height(0, 0) - world.height(0.1, 0))).toBeLessThan(1);
	});

	test('returns the same surface triangle used by height and groundNormal', () => {
		const world = new World(42);
		const sample = world.sampleSurface(17.25, -9.75);
		const normal = world.groundNormal(17.25, -9.75);

		expect(sample.height).toBeCloseTo(world.height(17.25, -9.75), 12);
		expect(sample.x).toBeCloseTo(normal.x, 12);
		expect(sample.y).toBeCloseTo(normal.y, 12);
		expect(sample.z).toBeCloseTo(normal.z, 12);

		const result = { height: 0, x: 0, y: 0, z: 0 };
		expect(world.sampleSurfaceToRef(-31.2, 44.6, result)).toBe(result);
		expect(result.height).toBeCloseTo(world.height(-31.2, 44.6), 12);
	});
});

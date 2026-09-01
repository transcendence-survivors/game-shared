import { describe, expect, test } from 'vitest';
import { chaseStep } from './MonsterAi';

describe('allocation-free monster movement', () => {
	test('matches allocated results and reuses the output', () => {
		const output = { x: 0, z: 0, rotationY: 0, inRange: false };
		for (let index = 0; index < 100; index++) {
			const from = { x: index - 20, z: Math.sin(index) * 5 };
			const target = { x: 30 - index, z: Math.cos(index) * 7 };
			const expected = chaseStep(
				from,
				target,
				index % 13,
				1 / (20 + index),
				2 + (index % 4),
			);
			const actual = chaseStep(
				from,
				target,
				index % 13,
				1 / (20 + index),
				2 + (index % 4),
				output,
			);
			expect(actual).toBe(output);
			expect(actual).toEqual(expected);
		}
	});
});

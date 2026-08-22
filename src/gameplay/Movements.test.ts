import { describe, expect, test } from 'vitest';
import type { MoveInput } from '../utils/Types';
import { World } from '../world/World';
import { createMovementState, simulatePlayerMovement } from './Movements';

describe('allocation-free player movement', () => {
	test('matches the existing simulation over varied deterministic inputs', () => {
		const world = new World(42);
		let state = createMovementState(3, world.height(3, 5), 5);
		const output = { ...state };
		for (let index = 1; index <= 500; index++) {
			const input: MoveInput = {
				seq: index,
				forward: index % 2 === 0,
				backward: index % 11 === 0,
				left: index % 5 === 0,
				right: index % 3 === 0,
				jump: index % 73 === 0,
				deltaTime: 1 / (30 + (index % 90)),
				cameraYaw: Math.sin(index * 0.37) * Math.PI,
			};
			const expected = simulatePlayerMovement(world, state, input, 8);
			const actual = simulatePlayerMovement(
				world,
				state,
				input,
				8,
				output,
			);
			expect(actual).toEqual(expected);
			state = { ...expected };
		}
		expect(Number.isFinite(state.x)).toBe(true);
		expect(Number.isFinite(state.z)).toBe(true);
		expect(state.y).toBeCloseTo(world.height(state.x, state.z), 12);
		expect(state.velocityY).toBe(0);
		expect(state.isGrounded).toBe(true);
	});

	test('supports updating the state in place', () => {
		const world = new World(7);
		const state = createMovementState(0, world.height(0, 0));
		const input: MoveInput = {
			seq: 1,
			forward: true,
			backward: false,
			left: false,
			right: false,
			jump: false,
			deltaTime: 1 / 60,
			cameraYaw: 0.5,
		};
		const expected = simulatePlayerMovement(world, state, input, 8);
		expect(simulatePlayerMovement(world, state, input, 8, state)).toEqual(
			expected,
		);
	});

	test('keeps airborne prediction invariant across frame batching', () => {
		const world = new World(7);
		const ground = world.height(0, 0);
		const initial = createMovementState(0, ground);
		const input: MoveInput = {
			seq: 1,
			forward: false,
			backward: false,
			left: false,
			right: false,
			jump: true,
			deltaTime: 1 / 30,
			cameraYaw: 0,
		};
		const batched = simulatePlayerMovement(world, initial, input, 8);
		const firstFrame = simulatePlayerMovement(
			world,
			initial,
			{ ...input, deltaTime: 1 / 60 },
			8,
		);
		const secondFrame = simulatePlayerMovement(
			world,
			firstFrame,
			{ ...input, seq: 2, jump: false, deltaTime: 1 / 60 },
			8,
		);

		expect(secondFrame.y).toBeCloseTo(batched.y, 12);
		expect(secondFrame.velocityY).toBeCloseTo(batched.velocityY, 12);
	});
});

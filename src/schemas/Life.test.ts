import { describe, expect, it } from 'vitest';
import { Life } from './Life';

describe('Life', () => {
	it('starts at full life', () => {
		const life = new Life(100);
		expect(life.max).toBe(100);
		expect(life.current).toBe(100);
		expect(life.isDepleted()).toBe(false);
		expect(life.ratio()).toBe(1);
	});

	it('rejects a non-positive or non-finite max', () => {
		expect(() => new Life(0)).toThrow(RangeError);
		expect(() => new Life(-10)).toThrow(RangeError);
		expect(() => new Life(NaN)).toThrow(RangeError);
		expect(() => new Life(Infinity)).toThrow(RangeError);
	});

	it('subtracts damage from current life', () => {
		const life = new Life(100);
		life.takeDamage(30);
		expect(life.current).toBe(70);
		expect(life.ratio()).toBe(0.7);
	});

	it('never drops below zero', () => {
		const life = new Life(100);
		life.takeDamage(250);
		expect(life.current).toBe(0);
		expect(life.isDepleted()).toBe(true);
	});

	it('ignores invalid damage amounts', () => {
		const life = new Life(100);
		life.takeDamage(-5);
		life.takeDamage(0);
		life.takeDamage(NaN);
		life.takeDamage(Infinity);
		expect(life.current).toBe(100);
	});

	it('heals without exceeding max', () => {
		const life = new Life(100);
		life.takeDamage(40);
		life.heal(15);
		expect(life.current).toBe(75);
		life.heal(9999);
		expect(life.current).toBe(100);
	});

	it('ignores invalid heal amounts', () => {
		const life = new Life(100);
		life.takeDamage(40);
		life.heal(-5);
		life.heal(NaN);
		expect(life.current).toBe(60);
	});

	it('rescales max while preserving the current ratio', () => {
		const life = new Life(100);
		life.takeDamage(50);
		life.rescale(200);
		expect(life.max).toBe(200);
		expect(life.current).toBe(100);
		expect(life.ratio()).toBe(0.5);
	});

	it('ignores invalid rescale values', () => {
		const life = new Life(100);
		life.rescale(0);
		life.rescale(-10);
		life.rescale(NaN);
		expect(life.max).toBe(100);
	});

	it('refills to full life', () => {
		const life = new Life(100);
		life.takeDamage(99);
		life.refill();
		expect(life.current).toBe(100);
	});
});

import { describe, expect, it } from 'vitest';
import { Experience, xpRequiredForLevel } from './Experience';
import { XP_BASE_TO_LEVEL, XP_LEVEL_GROWTH } from '../utils/Constants';

describe('xpRequiredForLevel', () => {
	it('starts at the base requirement for level 1', () => {
		expect(xpRequiredForLevel(1)).toBe(XP_BASE_TO_LEVEL);
	});

	it('grows with each level', () => {
		expect(xpRequiredForLevel(2)).toBe(
			Math.round(XP_BASE_TO_LEVEL * XP_LEVEL_GROWTH),
		);
		expect(xpRequiredForLevel(3)).toBeGreaterThan(xpRequiredForLevel(2));
	});
});

describe('Experience', () => {
	it('starts at level 1 with no xp', () => {
		const experience = new Experience();
		expect(experience.level).toBe(1);
		expect(experience.xp).toBe(0);
		expect(experience.xpToNextLevel).toBe(xpRequiredForLevel(1));
		expect(experience.ratio()).toBe(0);
	});

	it('accumulates xp below the level threshold', () => {
		const experience = new Experience();
		experience.gain(40);
		expect(experience.level).toBe(1);
		expect(experience.xp).toBe(40);
	});

	it('levels up and carries the overflow', () => {
		const experience = new Experience();
		experience.gain(xpRequiredForLevel(1) + 25);
		expect(experience.level).toBe(2);
		expect(experience.xp).toBe(25);
		expect(experience.xpToNextLevel).toBe(xpRequiredForLevel(2));
	});

	it('levels up several times from a single gain', () => {
		const experience = new Experience();
		experience.gain(xpRequiredForLevel(1) + xpRequiredForLevel(2) + 5);
		expect(experience.level).toBe(3);
		expect(experience.xp).toBe(5);
		expect(experience.xpToNextLevel).toBe(xpRequiredForLevel(3));
	});

	it('ignores invalid gain amounts', () => {
		const experience = new Experience();
		experience.gain(-10);
		experience.gain(0);
		experience.gain(NaN);
		experience.gain(Infinity);
		expect(experience.level).toBe(1);
		expect(experience.xp).toBe(0);
	});
});

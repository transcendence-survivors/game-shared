import { describe, expect, test } from 'vitest';
import {
	bossTimeAt,
	computeArchetypeStats,
	difficultyStageAt,
	MONSTER_DIRECTOR_CONFIG,
	normalMonsterDefinitions,
	targetPopulation,
} from '../index';

describe('monster difficulty director', () => {
	test('schedules one boss every five minutes', () => {
		expect(bossTimeAt(0)).toBe(300);
		expect(bossTimeAt(1)).toBe(600);
		expect(bossTimeAt(2)).toBe(900);
	});

	test('ramps pressure without healing existing monsters', () => {
		const opening = difficultyStageAt(0);
		const late = difficultyStageAt(2_400);

		expect(opening.population).toBe(18);
		expect(late.population).toBe(MONSTER_DIRECTOR_CONFIG.maxPopulation);
		expect(late.spawnRate).toBeGreaterThan(opening.spawnRate);
		expect(late.healthMultiplier).toBeGreaterThan(opening.healthMultiplier);
		expect(targetPopulation(0, 0)).toBe(0);
		expect(targetPopulation(0, 4)).toBe(54);
	});

	test('applies archetype and elite/boss rank multipliers at spawn time', () => {
		const normal = computeArchetypeStats('grunt', 0, 'normal', 1);
		const elite = computeArchetypeStats('grunt', 0, 'elite', 1);
		const soloBoss = computeArchetypeStats('arakhnos', 300, 'boss', 1);
		const coOpBoss = computeArchetypeStats('arakhnos', 300, 'boss', 4);

		expect(elite.maxLife).toBeGreaterThan(normal.maxLife * 2);
		expect(elite.xpReward).toBeGreaterThan(normal.xpReward * 2);
		expect(coOpBoss.maxLife).toBeGreaterThan(soloBoss.maxLife);
		expect(normal.moveSpeed).toBeGreaterThan(0);
	});

	test('unlocks normal archetypes progressively', () => {
		expect(normalMonsterDefinitions(0).map(({ kind }) => kind)).toEqual([
			'grunt',
			'skitter',
		]);
		expect(
			normalMonsterDefinitions(600).some(
				({ kind }) => kind === 'necromancer',
			),
		).toBe(true);
		expect(
			normalMonsterDefinitions(600).some(({ kind }) => kind === 'brute'),
		).toBe(false);
	});
});

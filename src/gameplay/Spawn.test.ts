import { describe, expect, it } from 'vitest';
import { findSpawnPoint } from './Spawn';
import { resolveTerrainCollision } from './Collisions';
import { World } from '../world/World';
import { ACCESS_RADIUS } from '../utils/Constants';

const SEEDS = [1, 7, 42, 123, 999, 20240720, 0xdead, 0xbeef];

/** Un joueur posé au sol peut-il quitter sa case dans au moins une direction ? */
function canLeave(world: World, x: number, y: number, z: number): boolean {
	const step = world.CELL;
	for (const [dx, dz] of [
		[step, 0],
		[-step, 0],
		[0, step],
		[0, -step],
	]) {
		const moved = resolveTerrainCollision(
			world,
			{ x, z },
			{ x: x + dx, z: z + dz },
			y,
		);
		if (moved.x !== x || moved.z !== z) return true;
	}
	return false;
}

describe('findSpawnPoint', () => {
	it('cale toujours le spawn sur la hauteur du sol (jamais enterré)', () => {
		for (const seed of SEEDS) {
			const world = new World(seed);
			const spawn = findSpawnPoint(world, 0, 0, 0, 0, ACCESS_RADIUS);
			expect(spawn.y).toBe(world.height(spawn.x, spawn.z));
		}
	});

	it('reste dans le rayon d’accès autour du centre de zone', () => {
		for (const seed of SEEDS) {
			const world = new World(seed);
			const cx = 250;
			const cz = -120;
			const spawn = findSpawnPoint(world, cx, cz, cx, cz, ACCESS_RADIUS);
			const dist = Math.hypot(spawn.x - cx, spawn.z - cz);
			expect(dist).toBeLessThanOrEqual(ACCESS_RADIUS);
		}
	});

	it('ne fait jamais apparaître le joueur bloqué dans un mur', () => {
		for (const seed of SEEDS) {
			const world = new World(seed);
			const spawn = findSpawnPoint(world, 0, 0, 0, 0, ACCESS_RADIUS);
			expect(canLeave(world, spawn.x, spawn.y, spawn.z)).toBe(true);
		}
	});

	it('privilégie le point préféré quand plusieurs zones sont libres', () => {
		const world = new World(42);
		const preferX = 60;
		const preferZ = 60;
		const spawn = findSpawnPoint(
			world,
			preferX,
			preferZ,
			0,
			0,
			ACCESS_RADIUS,
		);
		// Le spawn préféré doit être au moins aussi proche de la préférence
		// que le spawn centré sur l'origine.
		const centered = findSpawnPoint(world, 0, 0, 0, 0, ACCESS_RADIUS);
		const dPref = Math.hypot(spawn.x - preferX, spawn.z - preferZ);
		const dCentered = Math.hypot(
			centered.x - preferX,
			centered.z - preferZ,
		);
		expect(dPref).toBeLessThanOrEqual(dCentered);
	});
});

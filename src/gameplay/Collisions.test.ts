import { describe, expect, it } from 'vitest';
import { resolveTerrainCollision } from './Collisions';
import { World } from '../world/World';
import { PLAYER_STEP_UP } from '../utils/Constants';

const SEEDS = [1, 7, 42, 123, 999, 20240720, 0xdead, 0xbeef];

interface RampCase {
	world: World;
	gx: number;
	gz: number;
	/** Direction de la montée. */
	dx: number;
	dz: number;
	/** Direction latérale (perpendiculaire), vers une case du même palier. */
	sx: number;
	sz: number;
	tier: number;
}

/**
 * Cherche des rampes possédant une case latérale au MÊME palier : c'est la
 * configuration du bug (on longe le pied de la falaise et on aborde le flanc de
 * la rampe, qui est un mur de terre à l'écran).
 */
function findRamps(world: World, radius = 24, limit = 8): RampCase[] {
	const found: RampCase[] = [];
	for (let gx = -radius; gx <= radius && found.length < limit; gx++) {
		for (let gz = -radius; gz <= radius && found.length < limit; gz++) {
			const d = world.rampDir(gx, gz);
			if (!d) continue;
			const tier = world.tier(gx, gz);
			// Perpendiculaires à la pente.
			for (const [sx, sz] of [
				[d[1], d[0]],
				[-d[1], -d[0]],
			]) {
				if (world.tier(gx + sx, gz + sz) !== tier) continue;
				// La case de départ doit être plate (sol = palier).
				if (world.rampDir(gx + sx, gz + sz)) continue;
				found.push({ world, gx, gz, dx: d[0], dz: d[1], sx, sz, tier });
				break;
			}
		}
	}
	return found;
}

/** Rejoue la boucle de mouvement du jeu : collision puis calage sur le sol. */
function walk(
	world: World,
	start: { x: number; z: number; y: number },
	dirX: number,
	dirZ: number,
	steps: number,
	stepLen = 0.5,
) {
	let { x, z, y } = start;
	for (let i = 0; i < steps; i++) {
		const resolved = resolveTerrainCollision(
			world,
			{ x, z },
			{ x: x + dirX * stepLen, z: z + dirZ * stepLen },
			y,
		);
		x = resolved.x;
		z = resolved.z;
		y = Math.max(y, world.height(x, z));
	}
	return { x, y, z };
}

describe('resolveTerrainCollision', () => {
	it('interdit de gravir une rampe par son flanc', () => {
		let checked = 0;
		for (const seed of SEEDS) {
			const world = new World(seed);
			for (const r of findRamps(world)) {
				const CELL = world.CELL;
				const floorY = r.tier * world.STEP;
				// Départ au centre de la case latérale, à mi-longueur de la
				// rampe : le mur de terre y fait la moitié d'un palier.
				const start = {
					x: (r.gx + r.sx + 0.5) * CELL,
					z: (r.gz + r.sz + 0.5) * CELL,
					y: floorY,
				};
				expect(world.height(start.x, start.z)).toBe(floorY);
				// On fonce vers la rampe, largement de quoi la traverser.
				const end = walk(world, start, -r.sx, -r.sz, 120);
				checked++;
				expect(end.y).toBeLessThanOrEqual(floorY + PLAYER_STEP_UP);
			}
		}
		expect(checked).toBeGreaterThan(0);
	});

	it('laisse gravir une rampe par sa base', () => {
		let checked = 0;
		for (const seed of SEEDS) {
			const world = new World(seed);
			for (const r of findRamps(world)) {
				const CELL = world.CELL;
				const floorY = r.tier * world.STEP;
				// Centre de la case plate située en amont de la pente.
				const start = {
					x: (r.gx - r.dx + 0.5) * CELL,
					z: (r.gz - r.dz + 0.5) * CELL,
					y: floorY,
				};
				const end = walk(world, start, r.dx, r.dz, 120);
				checked++;
				expect(end.y).toBeGreaterThanOrEqual(floorY + world.STEP);
			}
		}
		expect(checked).toBeGreaterThan(0);
	});

	it('interdit de gravir une falaise', () => {
		let checked = 0;
		for (const seed of SEEDS) {
			const world = new World(seed);
			const CELL = world.CELL;
			for (let gx = -20; gx <= 20 && checked < 8; gx++) {
				for (let gz = -20; gz <= 20 && checked < 8; gz++) {
					const tier = world.tier(gx, gz);
					if (world.rampDir(gx, gz)) continue;
					// Voisin plus haut, atteignable par aucune rampe d'ici.
					const dx = 1;
					const dz = 0;
					if (world.tier(gx + dx, gz + dz) !== tier + 1) continue;
					const floorY = tier * world.STEP;
					const start = {
						x: (gx + 0.5) * CELL,
						z: (gz + 0.5) * CELL,
						y: floorY,
					};
					const end = walk(world, start, dx, dz, 60);
					checked++;
					expect(end.y).toBeLessThanOrEqual(floorY + PLAYER_STEP_UP);
				}
			}
		}
		expect(checked).toBeGreaterThan(0);
	});
});

import type { World } from '../world/World';
import { CARDINAL_GRID_DIRECTIONS } from '../utils/Constants';
import type { Vec3d } from '../utils/Types';

// Score de 0 (cuvette bloquante) à 8 (plateau plat).
function openness(world: World, gx: number, gz: number): number {
	const here = world.tier(gx, gz);
	let score = 0;
	let ramp: ReturnType<World['rampDir']> = null;
	let rampResolved = false;
	for (const [dx, dz] of CARDINAL_GRID_DIRECTIONS) {
		const to = world.tier(gx + dx, gz + dz);
		if (to === here) {
			score += 2;
		} else if (to < here) {
			score += 1;
		} else if (to === here + 1) {
			if (!rampResolved) {
				ramp = world.rampDir(gx, gz);
				rampResolved = true;
			}
			if (ramp && ramp[0] === dx && ramp[1] === dz) score += 1;
		}
	}
	return score;
}

// Retient la cellule sûre la plus dégagée, puis la plus proche du point préféré.
export function findSpawnPoint(
	world: World,
	preferX: number,
	preferZ: number,
	boundX: number,
	boundZ: number,
	radius: number,
): Vec3d {
	const CELL = world.CELL;
	const r2 = radius * radius;

	const gxMin = Math.floor((boundX - radius) / CELL);
	const gxMax = Math.floor((boundX + radius) / CELL);
	const gzMin = Math.floor((boundZ - radius) / CELL);
	const gzMax = Math.floor((boundZ + radius) / CELL);

	let bestGx = Math.floor(boundX / CELL);
	let bestGz = Math.floor(boundZ / CELL);
	let bestScore = -1;
	let bestDist = Infinity;

	for (let gx = gxMin; gx <= gxMax; gx++) {
		const cx = (gx + 0.5) * CELL;
		for (let gz = gzMin; gz <= gzMax; gz++) {
			const cz = (gz + 0.5) * CELL;
			const bdx = cx - boundX;
			const bdz = cz - boundZ;
			if (bdx * bdx + bdz * bdz > r2) continue;

			const score = openness(world, gx, gz);
			const pdx = cx - preferX;
			const pdz = cz - preferZ;
			const dist = pdx * pdx + pdz * pdz;
			if (score > bestScore || (score === bestScore && dist < bestDist)) {
				bestScore = score;
				bestDist = dist;
				bestGx = gx;
				bestGz = gz;
			}
		}
	}

	const x = (bestGx + 0.5) * CELL;
	const z = (bestGz + 0.5) * CELL;
	return { x, y: world.height(x, z), z };
}

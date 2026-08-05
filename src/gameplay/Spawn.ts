import type { World } from '../world/World';

export interface SpawnPoint {
	x: number;
	y: number;
	z: number;
}

const DIRS: ReadonlyArray<readonly [number, number]> = [
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1],
];

function openness(world: World, gx: number, gz: number): number {
	const here = world.tier(gx, gz);
	let score = 0;
	for (const [dx, dz] of DIRS) {
		const to = world.tier(gx + dx, gz + dz);
		if (to === here) {
			score += 2;
		} else if (to < here) {
			score += 1;
		} else if (to === here + 1) {
			const ramp = world.rampDir(gx, gz);
			if (ramp && ramp[0] === dx && ramp[1] === dz) score += 1; // rampe
		}
	}
	return score;
}

export function findSpawnPoint(
	world: World,
	preferX: number,
	preferZ: number,
	boundX: number,
	boundZ: number,
	radius: number,
): SpawnPoint {
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

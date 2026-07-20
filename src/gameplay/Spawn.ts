import type { World } from '../world/World';

export interface SpawnPoint {
	x: number;
	y: number;
	z: number;
}

/** Voisins orthogonaux. */
const DIRS: ReadonlyArray<readonly [number, number]> = [
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1],
];

/**
 * Confort d'une cellule pour un joueur posé sur son sol (y = palier * STEP) :
 * plus le score est haut, plus la case est dégagée. On récompense les voisins
 * de même palier (sol plat) et on autorise les descentes / rampes montantes,
 * exactement comme la résolution de collision. Un voisin infranchissable
 * (falaise > 1 palier ou marche sans rampe) rapporte 0.
 *
 * Score 8 = plateau parfaitement plat ; 0 = cuvette dont on ne peut sortir,
 * c'est-à-dire une case où le joueur serait « bloqué dans un mur ».
 */
function openness(world: World, gx: number, gz: number): number {
	const here = world.tier(gx, gz);
	let score = 0;
	for (const [dx, dz] of DIRS) {
		const to = world.tier(gx + dx, gz + dz);
		if (to === here) {
			score += 2; // sol plat, déplacement libre
		} else if (to < here) {
			score += 1; // on peut toujours descendre
		} else if (to === here + 1) {
			const ramp = world.rampDir(gx, gz);
			if (ramp && ramp[0] === dx && ramp[1] === dz) score += 1; // rampe
		}
	}
	return score;
}

/**
 * Cherche une position de spawn sûre pour un joueur.
 *
 * On balaie les cellules contenues dans le rayon `radius` autour du centre de
 * zone (boundX, boundZ) et on retient la plus dégagée (voir {@link openness}),
 * en départageant par la proximité au point préféré (preferX, preferZ). La
 * position renvoyée est centrée sur la cellule et calée sur la hauteur du sol,
 * si bien que le joueur n'apparaît jamais enterré dans un mur ni coincé dans
 * une cuvette tant qu'une case dégagée existe dans la zone.
 */
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
			// Rester dans le rayon d'accès (mesuré au centre de la case).
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

import { PLAYER_HB_RADIUS, PLAYER_STEP_UP } from '../utils/Constants';
import type { World } from '../world/World';

/** Tolérance verticale : le joueur est considéré « au niveau » du sol. */
const GROUND_EPS = 0.1;
/** Retrait utilisé pour sonder le sol de part et d'autre d'une frontière. */
const PROBE = 0.01;

function cellOf(world: World, x: number, z: number) {
	return {
		cellX: Math.floor(x / world.CELL),
		cellZ: Math.floor(z / world.CELL),
	};
}

function clamp(v: number, min: number, max: number): number {
	return v < min ? min : v > max ? max : v;
}

/** Point de la cellule (cellX, cellZ) le plus proche de (x, z), bords exclus. */
function clampToCell(
	world: World,
	cellX: number,
	cellZ: number,
	x: number,
	z: number,
) {
	const CELL = world.CELL;
	return {
		x: clamp(x, cellX * CELL + PROBE, (cellX + 1) * CELL - PROBE),
		z: clamp(z, cellZ * CELL + PROBE, (cellZ + 1) * CELL - PROBE),
	};
}

/**
 * Hauteur de la marche à franchir pour passer de la cellule de départ à la
 * cellule visée, mesurée AU RAS de la frontière traversée (et non au point
 * d'arrivée, qui peut être loin dans la case).
 *
 * Une rampe est continue avec ses deux cases voisines dans le sens de la pente
 * (marche ~ 0), alors qu'une falaise — ou le FLANC d'une rampe, qui est bien un
 * mur de terre à l'écran — présente une vraie marche. Comparer les paliers ne
 * suffit pas : une case-rampe porte le palier du bas alors que son sol monte
 * jusqu'au palier du dessus.
 */
function stepHeight(
	world: World,
	fromCellX: number,
	fromCellZ: number,
	toCellX: number,
	toCellZ: number,
	x: number,
	z: number,
): number {
	const a = clampToCell(world, fromCellX, fromCellZ, x, z);
	const b = clampToCell(world, toCellX, toCellZ, a.x, a.z);
	return world.height(b.x, b.z) - world.height(a.x, a.z);
}

function isSampleWalkable(
	world: World,
	fromCellX: number,
	fromCellZ: number,
	x: number,
	z: number,
	playerY: number,
) {
	const to = cellOf(world, x, z);
	if (to.cellX === fromCellX && to.cellZ === fromCellZ) return true;
	// Déjà au-dessus du sol visé : descente, plain-pied ou saut par-dessus.
	if (playerY >= world.height(x, z) - GROUND_EPS) return true;
	// Sinon on ne monte que par une transition continue : la rampe, jamais ses côtés.
	return (
		stepHeight(world, fromCellX, fromCellZ, to.cellX, to.cellZ, x, z) <=
		PLAYER_STEP_UP
	);
}

function isPositionWalkable(
	world: World,
	fromCellX: number,
	fromCellZ: number,
	x: number,
	z: number,
	playerY: number,
) {
	const offsets = [
		[0, 0],
		[PLAYER_HB_RADIUS, 0],
		[-PLAYER_HB_RADIUS, 0],
		[0, PLAYER_HB_RADIUS],
		[0, -PLAYER_HB_RADIUS],
	];

	for (const [dx, dz] of offsets) {
		if (
			!isSampleWalkable(
				world,
				fromCellX,
				fromCellZ,
				x + dx,
				z + dz,
				playerY,
			)
		) {
			return false;
		}
	}
	return true;
}

export function resolveTerrainCollision(
	world: World,
	currentPos: { x: number; z: number },
	targetPos: { x: number; z: number },
	playerY: number,
) {
	const from = cellOf(world, currentPos.x, currentPos.z);

	if (
		isPositionWalkable(
			world,
			from.cellX,
			from.cellZ,
			targetPos.x,
			targetPos.z,
			playerY,
		)
	)
		return { x: targetPos.x, z: targetPos.z };

	if (
		isPositionWalkable(
			world,
			from.cellX,
			from.cellZ,
			targetPos.x,
			currentPos.z,
			playerY,
		)
	)
		return { x: targetPos.x, z: currentPos.z };

	if (
		isPositionWalkable(
			world,
			from.cellX,
			from.cellZ,
			currentPos.x,
			targetPos.z,
			playerY,
		)
	)
		return { x: currentPos.x, z: targetPos.z };

	return { x: currentPos.x, z: currentPos.z };
}

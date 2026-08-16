import { PLAYER_HB_RADIUS, PLAYER_STEP_UP } from '../utils/Constants';
import type { World } from '../world/World';

/** Tolérance verticale : le joueur est considéré « au niveau » du sol. */
const GROUND_EPS = 0.1;
/** Retrait utilisé pour sonder le sol de part et d'autre d'une frontière. */
const PROBE = 0.01;
const COLLISION_SAMPLES = 16;

/** Centre + couronne du cylindre joueur, calculee une seule fois. */
const PLAYER_FOOTPRINT_OFFSETS: ReadonlyArray<readonly [number, number]> = [
	[0, 0],
	...Array.from({ length: COLLISION_SAMPLES }, (_, index) => {
		const angle = (index * Math.PI * 2) / COLLISION_SAMPLES;
		return [
			Math.cos(angle) * PLAYER_HB_RADIUS,
			Math.sin(angle) * PLAYER_HB_RADIUS,
		] as const;
	}),
];

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
	for (const [dx, dz] of PLAYER_FOOTPRINT_OFFSETS) {
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

/**
 * Extrait un joueur dont le centre est valide mais dont le volume chevauche
 * deja un mur. Sans cette depenetration, chaque petit pas de sortie est refuse
 * et le joueur reste prisonnier de sa position precedente.
 */
function recoverEmbeddedPosition(
	world: World,
	cellX: number,
	cellZ: number,
	currentPos: { x: number; z: number },
	playerY: number,
) {
	const margin = PLAYER_HB_RADIUS + PROBE;
	const recovered = {
		x: clamp(
			currentPos.x,
			cellX * world.CELL + margin,
			(cellX + 1) * world.CELL - margin,
		),
		z: clamp(
			currentPos.z,
			cellZ * world.CELL + margin,
			(cellZ + 1) * world.CELL - margin,
		),
	};
	if (
		isPositionWalkable(
			world,
			cellX,
			cellZ,
			recovered.x,
			recovered.z,
			playerY,
		)
	)
		return recovered;

	// Secours pour un ancien etat tres enfonce ou une geometrie de rampe rare.
	const center = {
		x: (cellX + 0.5) * world.CELL,
		z: (cellZ + 0.5) * world.CELL,
	};
	return isPositionWalkable(world, cellX, cellZ, center.x, center.z, playerY)
		? center
		: currentPos;
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

	if (
		!isPositionWalkable(
			world,
			from.cellX,
			from.cellZ,
			currentPos.x,
			currentPos.z,
			playerY,
		)
	)
		return recoverEmbeddedPosition(
			world,
			from.cellX,
			from.cellZ,
			currentPos,
			playerY,
		);

	return { x: currentPos.x, z: currentPos.z };
}

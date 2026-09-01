import { PLAYER_HB_RADIUS, PLAYER_STEP_UP, TAU } from '../utils/Constants';
import type { Vec2d } from '../utils/Types';
import type { World } from '../world/World';

const GROUND_EPS = 0.1;
const PROBE = 0.01;
const COLLISION_SAMPLES = 16;

const FOOTPRINT_DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
	[0, 0],
	...Array.from({ length: COLLISION_SAMPLES }, (_, index) => {
		const angle = (index * TAU) / COLLISION_SAMPLES;
		return [Math.cos(angle), Math.sin(angle)] as const;
	}),
];

function clamp(v: number, min: number, max: number): number {
	return v < min ? min : v > max ? max : v;
}

// Mesure la marche au ras de la frontière afin de distinguer rampe et falaise.
function stepHeight(
	world: World,
	fromCellX: number,
	fromCellZ: number,
	toCellX: number,
	toCellZ: number,
	x: number,
	z: number,
): number {
	const cell = world.CELL;
	const ax = clamp(
		x,
		fromCellX * cell + PROBE,
		(fromCellX + 1) * cell - PROBE,
	);
	const az = clamp(
		z,
		fromCellZ * cell + PROBE,
		(fromCellZ + 1) * cell - PROBE,
	);
	const bx = clamp(ax, toCellX * cell + PROBE, (toCellX + 1) * cell - PROBE);
	const bz = clamp(az, toCellZ * cell + PROBE, (toCellZ + 1) * cell - PROBE);
	return world.height(bx, bz) - world.height(ax, az);
}

function isSampleWalkable(
	world: World,
	fromCellX: number,
	fromCellZ: number,
	x: number,
	z: number,
	playerY: number,
) {
	const toCellX = Math.floor(x / world.CELL);
	const toCellZ = Math.floor(z / world.CELL);
	if (toCellX === fromCellX && toCellZ === fromCellZ) return true;
	if (playerY >= world.height(x, z) - GROUND_EPS) return true;
	return (
		stepHeight(world, fromCellX, fromCellZ, toCellX, toCellZ, x, z) <=
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
	footprintRadius = PLAYER_HB_RADIUS,
) {
	for (const [directionX, directionZ] of FOOTPRINT_DIRECTIONS) {
		if (
			!isSampleWalkable(
				world,
				fromCellX,
				fromCellZ,
				x + directionX * footprintRadius,
				z + directionZ * footprintRadius,
				playerY,
			)
		) {
			return false;
		}
	}
	return true;
}

function writeIfWalkable(
	world: World,
	cellX: number,
	cellZ: number,
	x: number,
	z: number,
	playerY: number,
	output: Vec2d,
	footprintRadius = PLAYER_HB_RADIUS,
): boolean {
	if (
		!isPositionWalkable(world, cellX, cellZ, x, z, playerY, footprintRadius)
	)
		return false;
	output.x = x;
	output.z = z;
	return true;
}

/** Keeps a player's center inside a moving circular access zone. */
export function clampPositionToCircle(
	position: Vec2d,
	centerX: number,
	centerZ: number,
	radius: number,
): boolean {
	if (
		!Number.isFinite(position.x) ||
		!Number.isFinite(position.z) ||
		!Number.isFinite(centerX) ||
		!Number.isFinite(centerZ) ||
		!Number.isFinite(radius)
	)
		return false;

	const maxRadius = Math.max(0, radius);
	const dx = position.x - centerX;
	const dz = position.z - centerZ;
	const distanceSquared = dx * dx + dz * dz;
	if (distanceSquared <= maxRadius * maxRadius || distanceSquared === 0)
		return false;

	const scale = maxRadius / Math.sqrt(distanceSquared);
	position.x = centerX + dx * scale;
	position.z = centerZ + dz * scale;
	return true;
}

// Dépénètre un joueur dont le volume chevauche déjà un mur.
function recoverEmbeddedPosition(
	world: World,
	cellX: number,
	cellZ: number,
	currentPos: Vec2d,
	playerY: number,
	output: Vec2d,
	footprintRadius = PLAYER_HB_RADIUS,
) {
	const margin = footprintRadius + PROBE;
	const recoveredX = clamp(
		currentPos.x,
		cellX * world.CELL + margin,
		(cellX + 1) * world.CELL - margin,
	);
	const recoveredZ = clamp(
		currentPos.z,
		cellZ * world.CELL + margin,
		(cellZ + 1) * world.CELL - margin,
	);
	if (
		writeIfWalkable(
			world,
			cellX,
			cellZ,
			recoveredX,
			recoveredZ,
			playerY,
			output,
			footprintRadius,
		)
	)
		return output;

	const centerX = (cellX + 0.5) * world.CELL;
	const centerZ = (cellZ + 0.5) * world.CELL;
	if (
		!writeIfWalkable(
			world,
			cellX,
			cellZ,
			centerX,
			centerZ,
			playerY,
			output,
			footprintRadius,
		)
	) {
		output.x = currentPos.x;
		output.z = currentPos.z;
	}
	return output;
}

export function resolveTerrainCollision(
	world: World,
	currentPos: Vec2d,
	targetX: number,
	targetZ: number,
	playerY: number,
	output: Vec2d = { x: 0, z: 0 },
	footprintRadius = PLAYER_HB_RADIUS,
): Vec2d {
	// A smooth terrain has no cell walls to block against. Vertical movement
	// still snaps the player to world.height() in the movement simulation.
	if (world.isSmoothTerrain) {
		output.x = targetX;
		output.z = targetZ;
		return output;
	}
	const fromCellX = Math.floor(currentPos.x / world.CELL);
	const fromCellZ = Math.floor(currentPos.z / world.CELL);
	const safeFootprintRadius = Number.isFinite(footprintRadius)
		? Math.max(0.1, footprintRadius)
		: PLAYER_HB_RADIUS;
	const write = (x: number, z: number) =>
		writeIfWalkable(
			world,
			fromCellX,
			fromCellZ,
			x,
			z,
			playerY,
			output,
			safeFootprintRadius,
		);
	if (
		write(targetX, targetZ) ||
		write(targetX, currentPos.z) ||
		write(currentPos.x, targetZ)
	)
		return output;
	if (
		!isPositionWalkable(
			world,
			fromCellX,
			fromCellZ,
			currentPos.x,
			currentPos.z,
			playerY,
			safeFootprintRadius,
		)
	)
		return recoverEmbeddedPosition(
			world,
			fromCellX,
			fromCellZ,
			currentPos,
			playerY,
			output,
			safeFootprintRadius,
		);
	output.x = currentPos.x;
	output.z = currentPos.z;
	return output;
}

export function groundHeightUnderHitbox(world: World, x: number, z: number) {
	const offsets: Array<[number, number]> = [
		[0, 0],
		[PLAYER_HB_RADIUS, 0],
		[-PLAYER_HB_RADIUS, 0],
		[0, PLAYER_HB_RADIUS],
		[0, -PLAYER_HB_RADIUS],
		[PLAYER_HB_RADIUS, PLAYER_HB_RADIUS],
		[-PLAYER_HB_RADIUS, PLAYER_HB_RADIUS],
		[PLAYER_HB_RADIUS, -PLAYER_HB_RADIUS],
		[-PLAYER_HB_RADIUS, -PLAYER_HB_RADIUS],
	];
	let maxH = -Infinity;
	for (const [dx, dz] of offsets) {
		const h = world.height(x + dx, z + dz);
		if (h > maxH) maxH = h;
	}
	return maxH;
}

import { PLAYER_HB_RADIUS, PLAYER_STEP_UP } from '../utils/Constants';
import type { World } from '../world/World';

const GROUND_EPS = 0.1;
const PROBE = 0.01;

function cellOf(world: World, x: number, z: number) {
	const sx = Math.round(x * 1000) / 1000;
	const sz = Math.round(z * 1000) / 1000;
	return {
		cellX: Math.floor(sx / world.CELL),
		cellZ: Math.floor(sz / world.CELL),
	};
}

function clamp(v: number, min: number, max: number): number {
	return v < min ? min : v > max ? max : v;
}

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
	if (playerY >= groundHeightUnderHitbox(world, x, z) - GROUND_EPS)
		return true;
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

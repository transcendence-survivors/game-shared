import { PLAYER_HB_RADIUS } from '../utils/Constants';
import type { World } from '../world/World';

function cellOf(world: World, x: number, z: number) {
	return {
		cellX: Math.floor(x / world.CELL),
		cellZ: Math.floor(z / world.CELL),
	};
}

function isCellTransitionWalkable(
	world: World,
	fromCellX: number,
	fromCellZ: number,
	toCellX: number,
	toCellZ: number,
	playerY: number,
) {
	if (fromCellX === toCellX && fromCellZ === toCellZ) return true;
	const toTier = world.tier(toCellX, toCellZ);
	const toHeight = toTier * world.STEP;
	if (playerY >= toHeight - 0.1) return true;
	const fromTier = world.tier(fromCellX, fromCellZ);
	if (toTier - fromTier === 1) {
		const dx = toCellX - fromCellX;
		const dz = toCellZ - fromCellZ;
		if (Math.abs(dx) + Math.abs(dz) !== 1) return false;
		const ramp = world.rampDir(fromCellX, fromCellZ);
		return !!ramp && ramp[0] === dx && ramp[1] === dz;
	}
	return false;
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
		const sample = cellOf(world, x + dx, z + dz);
		if (
			!isCellTransitionWalkable(
				world,
				fromCellX,
				fromCellZ,
				sample.cellX,
				sample.cellZ,
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

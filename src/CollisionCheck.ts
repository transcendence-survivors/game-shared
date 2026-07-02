import type { World } from './world/World';

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

export function resolveTerrainCollision(
	world: World,
	currentPos: { x: number; z: number },
	targetPos: { x: number; z: number },
	playerY: number,
) {
	const from = cellOf(world, currentPos.x, currentPos.z);

	const toFull = cellOf(world, targetPos.x, targetPos.z);
	if (
		isCellTransitionWalkable(
			world,
			from.cellX,
			from.cellZ,
			toFull.cellX,
			toFull.cellZ,
			playerY,
		)
	)
		return { x: targetPos.x, z: targetPos.z };

	const toX = cellOf(world, targetPos.x, currentPos.z);
	if (
		isCellTransitionWalkable(
			world,
			from.cellX,
			from.cellZ,
			toX.cellX,
			toX.cellZ,
			playerY,
		)
	)
		return { x: targetPos.x, z: currentPos.z };

	const toZ = cellOf(world, currentPos.x, targetPos.z);
	if (
		isCellTransitionWalkable(
			world,
			from.cellX,
			from.cellZ,
			toZ.cellX,
			toZ.cellZ,
			playerY,
		)
	)
		return { x: currentPos.x, z: targetPos.z };

	return { x: currentPos.x, z: currentPos.z };
}

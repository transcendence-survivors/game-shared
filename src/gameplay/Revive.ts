import type { Player } from '../schemas/GameState';
import {
	PLAYER_REVIVE_RADIUS,
	REVIVE_DURATION_S,
	REVIVE_HEALTH_RATIO,
} from '../utils/Constants';

interface GroundPosition {
	x: number;
	z: number;
}

export function canRevive(
	player: Pick<Player, 'isDowned' | 'life'>,
): boolean {
	return !player.isDowned && !player.life.isDepleted();
}

export function isWithinReviveRange(
	reviver: GroundPosition,
	downed: GroundPosition,
	radius: number = PLAYER_REVIVE_RADIUS,
): boolean {
	const deltaX = reviver.x - downed.x;
	const deltaZ = reviver.z - downed.z;
	return deltaX * deltaX + deltaZ * deltaZ <= radius * radius;
}

export function advanceReviveProgress(
	progress: number,
	deltaTime: number,
	durationS: number = REVIVE_DURATION_S,
): number {
	const current =
		Number.isFinite(progress) && progress > 0 ? Math.min(1, progress) : 0;
	if (!Number.isFinite(deltaTime) || deltaTime <= 0 || durationS <= 0)
		return current;
	return Math.min(1, current + deltaTime / durationS);
}

export function reviveHealthFor(player: Pick<Player, 'life'>): number {
	return player.life.max * REVIVE_HEALTH_RATIO;
}

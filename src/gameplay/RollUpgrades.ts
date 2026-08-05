import type { Player } from '../schemas/GameState';
import { UPGRADE_POOL, type UpgradeDef } from '../utils/Upgrades';

export function rollUpgradeOptions(
	_player: Player,
	count: number = 3,
): UpgradeDef[] {
	const pool = UPGRADE_POOL;

	for (let i = pool.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[pool[i], pool[j]] = [pool[j], pool[i]];
	}
	return pool.slice(0, count);
}

import type { MoveInput } from './utils/Types';

/** Colyseus room type shared by matchmaking clients and the server. */
export const GAME_ROOM_TYPE = 'game_room';
export const GAME_ROOM_NAME_PROPERTY = 'roomName';

/** Applies the canonical, locale-independent room-name normalization. */
export function normalizeRoomName(name: string): string {
	return name.trim().toLowerCase();
}

export const ClientMessage = {
	Move: 'move',
	RequestUpgradeOptions: 'requestUpgradeOptions',
	SelectUpgrade: 'selectUpgrade',
	SetDebugImmortal: 'setDebugImmortal',
	SetDebugMonsterStress: 'setDebugMonsterStress',
} as const;

/** Boolean property names required by every movement payload validator. */
export const MOVE_INPUT_BOOLEAN_FIELDS = [
	'forward',
	'backward',
	'right',
	'left',
	'jump',
] as const satisfies readonly (keyof MoveInput)[];

export const ServerMessage = {
	WorldSeed: 'gameStart',
	GameOver: 'gameOver',
	MonsterDamage: 'monsterDamage',
	LevelUp: 'levelUp',
	UpgradeOptions: 'upgradeOptions',
} as const;

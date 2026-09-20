import type { MoveInput } from './utils/Types';

export const GAME_ROOM_TYPE = 'game_room';
export const GAME_ROOM_NAME_PROPERTY = 'roomName';

export function normalizeRoomName(name: string): string {
	return name.trim().toLowerCase();
}

export const ClientMessage = {
	Move: 'move',
	RequestUpgradeOptions: 'requestUpgradeOptions',
	SelectUpgrade: 'selectUpgrade',
	Revive: 'revive',
	SetDebugImmortal: 'setDebugImmortal',
	SetDebugMonsterStress: 'setDebugMonsterStress',
} as const;

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

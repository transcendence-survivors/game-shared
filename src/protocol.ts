export const ClientMessage = {
	Move: 'move',
	RequestUpgradeOptions: 'requestUpgradeOptions',
	SelectUpgrade: 'selectUpgrade',
} as const;

export const ServerMessage = {
	WorldSeed: 'worldSeed',
	GameOver: 'gameOver',
	MonsterDamage: 'monsterDamage',
	LevelUp: 'levelUp',
	UpgradeOptions: 'upgradeOptions',
} as const;

export type ClientMessageName =
	(typeof ClientMessage)[keyof typeof ClientMessage];

export type ServerMessageName =
	(typeof ServerMessage)[keyof typeof ServerMessage];

/**
 * @file Public entry point for `@transcendence/game-shared`.
 *
 * Anything exported from here is part of the public API contract between the
 * Colyseus server and the Babylon client. Internal helpers should stay
 * unexported. Breaking changes here ripple to both apps simultaneously.
 */

export * from './protocol';
export * from './world';
export type {
	InputCommand,
	PingPayload,
	PongPayload,
	ReportLatencyPayload,
	KickPayload,
	KickedPayload,
	ChunkPayload,
	ChunkDropPayload,
	CreateGameOptions,
	JoinPublicOptions,
	JoinPrivateOptions,
	RoomListItem,
	PlayerStateView,
	RoomStateView,
} from './types';

/**
 * @file Public entry point for `@transcendence/game-shared`.
 *
 * Anything exported from here is part of the public API contract between the
 * Colyseus server and the Babylon client. Internal helpers should stay
 * unexported. Breaking changes here ripple to both apps simultaneously.
 */

export * from './protocol';
export type {
	InputCommand,
	PingPayload,
	PongPayload,
	ReportLatencyPayload,
	PlayerStateView,
} from './types';

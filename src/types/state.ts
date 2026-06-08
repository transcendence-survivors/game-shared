/**
 * @file Read-only views of the synced server state.
 *
 * These interfaces mirror the shape of the Colyseus schemas defined server-side.
 * They are declared here as plain TypeScript interfaces so the client can
 * type-check state updates without depending on `@colyseus/schema`.
 *
 * Invariant: any new field added to a server-side schema MUST also be added
 * here, otherwise the client will silently lose type-safety for that field.
 */

import type { RoomModeName, RoomPhaseName } from '../protocol';

/**
 * Authoritative per-player state as broadcast by the server.
 *
 * The `id` field equals the Colyseus `client.sessionId` and is stable for the
 * lifetime of the connection.
 */
export interface PlayerStateView {
	readonly id: string;
	/** Pseudonym chosen by the player at the menu. Shown in the lobby roster. */
	readonly name: string;
	/** Whether the player has toggled ready in the lobby. Drives auto-start. */
	readonly ready: boolean;
	/** World position X (meters). */
	readonly x: number;
	/** World position Y — height above the ground (meters). */
	readonly y: number;
	/** World position Z (meters). */
	readonly z: number;
	/**
	 * Latest round-trip latency reported by the client itself, in ms.
	 *
	 * Zero means "no measurement yet" — clients render this as `--` rather than
	 * a real number until the first ping/pong cycle completes.
	 */
	readonly latencyMs: number;
	/**
	 * Sequence number of the most recent {@link InputCommand} this player's
	 * client sent that the server has applied. The client compares it against
	 * its own pending inputs to reconcile prediction. Zero before the first
	 * input is received.
	 */
	readonly lastSeq: number;
}

/**
 * Authoritative room-level state as broadcast by the server.
 *
 * Mirrors the root Colyseus schema. The client reads `phase` to switch screens
 * (lobby → in-game), `hostId` to decide whether to show host controls (kick),
 * and `roomName` / `mode` to label the lobby.
 *
 * `players` is intentionally omitted here — the client consumes the player map
 * through Colyseus' per-entry `onAdd` / `onRemove` callbacks rather than as a
 * plain object, so its concrete shape stays SDK-specific (see `RoomHandler`).
 */
export interface RoomStateView {
	/** Current lifecycle phase. The client switches screens when this changes. */
	readonly phase: RoomPhaseName;
	/** `sessionId` of the host (first joiner). Empty before anyone joins. */
	readonly hostId: string;
	/** Host-chosen display name of the game. */
	readonly roomName: string;
	/** Visibility mode of the room. */
	readonly mode: RoomModeName;
	/** Monotonic simulation tick (only advances once the game is playing). */
	readonly tick: number;
	/**
	 * Procedural world seed for this room, chosen at creation. The terrain itself
	 * is streamed as chunks (the client never generates it), but the seed is
	 * exposed for debugging and any future client-side use.
	 */
	readonly seed: number;
}

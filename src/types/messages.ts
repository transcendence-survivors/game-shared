/**
 * @file Payload types for client→server and server→client messages, plus the
 * matchmaking option shapes passed when creating / joining a room.
 *
 * One interface per {@link ClientMessage} / {@link ServerMessage} entry. The
 * server is authoritative for gameplay — it consumes input payloads and updates
 * the synced state accordingly. For responsiveness the client may *predict* the
 * local player's horizontal motion from the same inputs and then reconcile
 * against each authoritative snapshot (see `LocalPredictor` client-side). The
 * server stays the single source of truth; prediction never changes what it
 * broadcasts.
 */

import type { RoomModeName, RoomPhaseName } from '../protocol';

// ---------------------------------------------------------------------------
// Matchmaking options (passed to client.create / join / joinById)
// ---------------------------------------------------------------------------

/**
 * Two distinct names travel through matchmaking — keep them separate:
 * - `roomName` identifies the *game* (chosen by the host, shown in the lobby).
 * - `playerName` is the *pseudonym* of the joining player.
 */

/**
 * Options sent by a host when creating a new game room (`client.create`).
 *
 * `password` is required when {@link mode} is `private` and ignored otherwise.
 * It is hashed server-side and never stored in plaintext nor echoed back.
 */
export interface CreateGameOptions {
	/** Display name of the game, chosen by the host. Used by `filterBy` for private joins. */
	roomName: string;
	/** Public (listed) or private (hidden, password-gated). */
	mode: RoomModeName;
	/** Host-defined password. Required iff `mode === 'private'`. */
	password?: string;
	/** Pseudonym of the host as it should appear in the lobby. */
	playerName: string;
}

/**
 * Options sent when joining a known public room by its id (`client.joinById`).
 * No password — public rooms are open; the id comes from the lobby listing.
 */
export interface JoinPublicOptions {
	/** Pseudonym of the joining player. */
	playerName: string;
}

/**
 * Options sent when joining a private room by name (`client.join`).
 *
 * The server matches the room via `filterBy(['roomName'])`, then verifies
 * `password` in `onAuth`. A mismatch (or unknown name) rejects the join.
 */
export interface JoinPrivateOptions {
	/** Name of the private game to join, as defined by its host. */
	roomName: string;
	/** Password to verify against the host-defined one. */
	password: string;
	/** Pseudonym of the joining player. */
	playerName: string;
}

/**
 * Metadata the server attaches to each public room, surfaced verbatim in the
 * {@link https://docs.colyseus.io/builtin-rooms/lobby/ | LobbyRoom} listing so
 * the client can render the "find a game" browser without joining first.
 */
export interface RoomListItem {
	/** Colyseus room id — pass to `client.joinById` to join this game. */
	roomId: string;
	/** Host-chosen display name. */
	roomName: string;
	/** Always `public` for listed rooms (private rooms are not listed). */
	mode: RoomModeName;
	/** Whether a password is required (always `false` for listed public rooms). */
	hasPassword: boolean;
	/** Current lifecycle phase — clients typically show only `lobby` rooms as joinable. */
	phase: RoomPhaseName;
	/** Number of connected clients. */
	clients: number;
	/** Capacity of the room. */
	maxClients: number;
}

/**
 * Per-tick movement / action input from a single player.
 *
 * Sent by the client on every frame where it has fresh input to communicate.
 * The server validates and applies the input during its next simulation tick.
 *
 * Conventions:
 * - Axis values are normalized to the closed range `[-1, 1]`. Out-of-range
 *   values are clamped server-side.
 * - The Z axis follows Babylon's left-handed world convention: `+Z` is forward.
 * - `jump` is an edge-triggered event: the server only accepts a jump if the
 *   player is currently grounded.
 */
export interface InputCommand {
	/** Movement intent along world X. `-1` = left, `0` = none, `+1` = right. */
	moveX: number;
	/** Movement intent along world Z. `-1` = backward, `0` = none, `+1` = forward. */
	moveZ: number;
	/** `true` when the player wants to jump this tick. */
	jump: boolean;
	/**
	 * Monotonic per-client sequence number, incremented once per sent input.
	 *
	 * The server stores the latest value it has applied and echoes it back via
	 * `PlayerStateView.lastSeq`. The client uses that acknowledgement to drop
	 * already-applied inputs and replay only the still-pending ones when
	 * reconciling its prediction (see `LocalPredictor`).
	 */
	seq: number;
}

/**
 * Latency probe payload.
 *
 * Carries the client-local timestamp at which the probe was emitted. The server
 * echoes it back unchanged so the client can compute `now - t` as the RTT
 * without depending on synchronized clocks.
 */
export interface PingPayload {
	/** Client-local timestamp in ms (`performance.now()`). */
	t: number;
}

/**
 * Echo of a {@link PingPayload}. Identical shape — the server only forwards
 * `t`, never reads or rewrites it.
 */
export interface PongPayload {
	/** Original client timestamp carried by the matching {@link PingPayload}. */
	t: number;
}

/**
 * Client report of its measured latency, used by the server to populate
 * `Player.latencyMs` so every client can render every other client's RTT.
 *
 * The server clamps the value to a sane range — a buggy or malicious client
 * cannot make the panel render absurd numbers.
 */
export interface ReportLatencyPayload {
	/** Measured round-trip latency in ms. */
	latencyMs: number;
}

/**
 * Host-only request to eject a player from the lobby.
 *
 * The server ignores it unless the sender is the current host and the target is
 * another player (a host cannot kick itself).
 */
export interface KickPayload {
	/** `sessionId` of the player to remove. */
	targetId: string;
}

/**
 * Sent by the server to a client right before it is removed by the host, so the
 * client can show why it left instead of silently dropping to the menu.
 */
export interface KickedPayload {
	/** Human-readable reason, e.g. "Kicked by host". */
	reason: string;
}

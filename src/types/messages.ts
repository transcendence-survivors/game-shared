/**
 * @file Payload types for client→server and server→client messages.
 *
 * One interface per {@link ClientMessage} / {@link ServerMessage} entry. The
 * server is authoritative for gameplay — it consumes input payloads and updates
 * the synced state accordingly. Clients never mutate their own position based
 * on local input.
 */

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

/**
 * @file Payload types for client→server messages.
 *
 * One interface per {@link ClientMessage} entry. The server is authoritative —
 * it consumes these payloads and updates the synced state accordingly.
 * Clients never mutate their own position based on local input.
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

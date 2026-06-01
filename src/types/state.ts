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

/**
 * Authoritative per-player state as broadcast by the server.
 *
 * The `id` field equals the Colyseus `client.sessionId` and is stable for the
 * lifetime of the connection.
 */
export interface PlayerStateView {
	readonly id: string;
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
}

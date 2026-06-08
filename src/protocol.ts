/**
 * @file Network protocol constants shared between the Colyseus client and server.
 *
 * Both ends import from this file to avoid string drift. Any new room or message
 * name must be added here first, then referenced by the client and server.
 */

/**
 * Canonical Colyseus room name for an actual game / lobby instance.
 *
 * Used by the client when creating or joining a game room
 * (`Colyseus.Client.create(ROOM_NAME, …)` / `joinById` / `join`) and by the
 * server when calling `gameServer.define(ROOM_NAME, GameRoom)`.
 */
export const ROOM_NAME = 'game' as const;

/**
 * Name of the built-in Colyseus {@link https://docs.colyseus.io/builtin-rooms/lobby/ | LobbyRoom}.
 *
 * The client joins this room to receive a live-updating list of public
 * {@link ROOM_NAME} rooms (created / filled / started / disposed). It carries no
 * gameplay — it is purely a real-time directory of joinable public games.
 */
export const LOBBY_NAME = 'lobby' as const;

/**
 * Visibility / matchmaking mode chosen by the room's host at creation time.
 *
 * - `Public`: listed in the {@link LOBBY_NAME} directory, joinable by anyone via
 *   its room id.
 * - `Private`: hidden from the directory (`room.setPrivate(true)` server-side),
 *   joinable only by supplying its `roomName` **and** the host-defined password.
 * - `Solo`: a single-seat room for one player. Not listed in the directory and
 *   capped at one client; it auto-starts the instant its creator joins, so the
 *   player drops straight into the game with no lobby / ready-up step.
 */
export const RoomMode = {
	/** Listed publicly, no password. */
	Public: 'public',
	/** Hidden from the directory, requires name + password to join. */
	Private: 'private',
	/** Single-player, unlisted, auto-starts on join. */
	Solo: 'solo',
} as const;

/** Union of all valid room modes. */
export type RoomModeName = (typeof RoomMode)[keyof typeof RoomMode];

/**
 * Lifecycle phase of a game room.
 *
 * A room is born in `Lobby` (players gather and ready up), then transitions
 * **once** to `Playing` when everyone is ready. The transition locks the room so
 * no further clients can join.
 */
export const RoomPhase = {
	/** Waiting room — players join and toggle their ready state. */
	Lobby: 'lobby',
	/** Simulation running — the room is locked, no new joins accepted. */
	Playing: 'playing',
} as const;

/** Union of all valid room phases. */
export type RoomPhaseName = (typeof RoomPhase)[keyof typeof RoomPhase];

/**
 * Names of all messages the client may send to the server.
 *
 * Kept as a frozen object literal so consumers can use the values directly
 * (e.g. `room.send(ClientMessage.Input, …)`) and so the union type
 * {@link ClientMessageName} can be derived at compile time.
 */
export const ClientMessage = {
	/** Per-tick movement / action input from the local player. */
	Input: 'input',
	/** Latency probe: client sends a local timestamp, expects a {@link ServerMessage.Pong} echo. */
	Ping: 'ping',
	/** Client-measured round-trip latency, written into the synced state by the server. */
	ReportLatency: 'reportLatency',
	/** Toggle the sender's ready state in the lobby. No payload. */
	ToggleReady: 'toggleReady',
	/** Host-only: request to eject another player from the lobby (see {@link KickPayload}). */
	Kick: 'kick',
	/**
	 * Sent once by a client when it has entered the playing scene and registered
	 * its terrain-chunk handlers. The server starts streaming chunks to that
	 * client only after this, so the initial burst is never sent before the
	 * client can receive it. No payload.
	 */
	EnterWorld: 'enterWorld',
} as const;

/** Union of all valid client→server message identifiers. */
export type ClientMessageName = (typeof ClientMessage)[keyof typeof ClientMessage];

/**
 * Names of all messages the server may send to a single client (out-of-band of
 * the synced state). State-sync changes flow through Colyseus' schema diffing
 * mechanism and are not declared here.
 */
export const ServerMessage = {
	/** Echo of a {@link ClientMessage.Ping}: lets the client measure RTT. */
	Pong: 'pong',
	/** Sent to a client just before the host ejects it from the lobby (see {@link KickedPayload}). */
	Kicked: 'kicked',
	/** A generated terrain chunk streamed to a client entering its range (see {@link ChunkPayload}). */
	Chunk: 'chunk',
	/** Tells a client to unload a terrain chunk that left its range (see {@link ChunkDropPayload}). */
	ChunkDrop: 'chunkDrop',
} as const;

/** Union of all valid server→client message identifiers. */
export type ServerMessageName = (typeof ServerMessage)[keyof typeof ServerMessage];

/**
 * Colyseus room-leave code the server uses when ejecting a kicked player.
 *
 * Distinguishes a host-initiated kick from a normal disconnect so the client can
 * surface an explanatory message instead of silently returning to the menu.
 * Must be ≥ 4000 (the WebSocket range reserved for application use).
 */
export const KICK_LEAVE_CODE = 4000 as const;

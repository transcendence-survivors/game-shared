/**
 * @file Network protocol constants shared between the Colyseus client and server.
 *
 * Both ends import from this file to avoid string drift. Any new room or message
 * name must be added here first, then referenced by the client and server.
 */

/**
 * Canonical Colyseus room name.
 *
 * Used by the client when calling `Colyseus.Client.joinOrCreate(ROOM_NAME, …)`
 * and by the server when calling `gameServer.define(ROOM_NAME, GameRoom)`.
 */
export const ROOM_NAME = 'game' as const;

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
} as const;

/** Union of all valid client→server message identifiers. */
export type ClientMessageName = (typeof ClientMessage)[keyof typeof ClientMessage];

/**
 * @file World / terrain constants shared by the client and server.
 *
 * The terrain is a Minecraft-style **heightmap** (no caves, no structures): for
 * every world column `(x, z)` there is one surface height (in blocks) and one
 * biome id. The authoritative generation runs server-side in the `terrain-gen`
 * wasm module; the server streams generated chunks to clients (Pattern B), which
 * only render them. These constants pin the shared contract: world size, chunk
 * size, the wire layout of a chunk, and the biome palette used for rendering.
 *
 * The Rust generator (`apps/game/terrain-gen/src/lib.rs`) mirrors `CHUNK_SIZE`,
 * `MAX_HEIGHT` and the biome ids — keep them in sync.
 */

/** World side length in blocks. The world is a square centred on the origin. */
export const WORLD_SIZE = 4096;

/** Half the world extent — world coords span `[-HALF_WORLD, HALF_WORLD)`. */
export const HALF_WORLD = WORLD_SIZE / 2; // 2048

/** Side length of a chunk in blocks (columns per side). */
export const CHUNK_SIZE = 16;

/** Columns in a chunk. */
export const CHUNK_AREA = CHUNK_SIZE * CHUNK_SIZE; // 256

/** Chunks along one world axis. */
export const CHUNKS_PER_SIDE = WORLD_SIZE / CHUNK_SIZE; // 256

/** Inclusive lower / exclusive upper chunk index (world centred on origin). */
export const MIN_CHUNK = -CHUNKS_PER_SIDE / 2; // -128
export const MAX_CHUNK = CHUNKS_PER_SIDE / 2; //  128 (exclusive)

/** Vertical block range. Surface heights live in `1..MAX_HEIGHT-1` (fit a u8). */
export const MAX_HEIGHT = 128;

/** Sea level in blocks — columns below this are underwater (ocean/coast). */
export const SEA_LEVEL = 46;

/**
 * Bytes in one streamed chunk: `CHUNK_AREA` heights (u8) followed by
 * `CHUNK_AREA` biome ids (u8), columns in row-major order (`lz * CHUNK_SIZE + lx`).
 * Matches the buffer the wasm `generate_chunk` writes.
 */
export const CHUNK_BYTES = CHUNK_AREA * 2; // 512

/**
 * Chebyshev radius (in chunks) of the streaming window kept loaded around each
 * player. Radius 5 ⇒ an 11×11 = 121-chunk window (~176×176 blocks visible).
 */
export const STREAM_RADIUS = 5;

/** Biome ids — must match the Rust generator's `NUM_BIOMES` ordering. */
export const Biome = {
	Ocean: 0,
	Plains: 1,
	Desert: 2,
	Forest: 3,
	Mountain: 4,
	Snow: 5,
} as const;

/** Union of all biome ids. */
export type BiomeId = (typeof Biome)[keyof typeof Biome];

/** Per-biome base surface colour (CSS hex), indexed by {@link Biome} id. */
export const BIOME_COLORS: readonly string[] = [
	'#3f6fa3', // 0 ocean   (mostly seen underwater)
	'#5fa84a', // 1 plains
	'#d9c27e', // 2 desert
	'#3f7d39', // 3 forest
	'#8d8378', // 4 mountain
	'#eef2f7', // 5 snow
];

/** Colour of the sea plane, rendered at {@link SEA_LEVEL}. */
export const WATER_COLOR = '#2f5d8a';

/** World coordinate → containing chunk index along one axis. */
export function worldToChunk(coord: number): number {
	return Math.floor(coord / CHUNK_SIZE);
}

/** Stable string key for a chunk coordinate, used in client/server maps. */
export function chunkKey(cx: number, cz: number): string {
	return `${cx},${cz}`;
}

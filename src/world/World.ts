import { makeNoise2D, type Noise2D } from './Noise';
import type { Vec3d } from '../utils/Types';

export interface WorldColor {
	r: number;
	g: number;
	b: number;
}

export interface WorldNormal extends Vec3d {}

/** Height and exact triangle normal of the rendered continuous terrain. */
export interface WorldSurfaceSample extends WorldNormal {
	height: number;
}

interface SurfaceCellHeights {
	h00: number;
	h10: number;
	h01: number;
	h11: number;
}

/** The rendered terrain uses the same grid resolution for every chunk. */
export const TERRAIN_SUBDIVISIONS_PER_CELL = 4;

const DIRS: ReadonlyArray<readonly [number, number]> = [
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1],
];
const GRASS = { r: 0.36, g: 0.55, b: 0.27 };
const DARK_GRASS = { r: 0.3, g: 0.48, b: 0.23 };
const ROCK = { r: 0.5, g: 0.47, b: 0.43 };
const SNOW = { r: 0.95, g: 0.96, b: 0.98 };
const RAW_CACHE_LIMIT = 1_000_000;
const DERIVED_CACHE_LIMIT = 250_000;
const CACHE_EVICTION_BATCH = 4_096;

/** Clé entière de cache (sans collision pour |coord| < 8.4M). */
function keyOf(gx: number, gz: number): number {
	return (gx + 0x800000) * 0x1000000 + (gz + 0x800000);
}

function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

export function clamp01(x: number): number {
	return x < 0 ? 0 : x > 1 ? 1 : x;
}

function mixC(a: WorldColor, b: WorldColor, t: number): WorldColor {
	return { r: lerp(a.r, b.r, t), g: lerp(a.g, b.g, t), b: lerp(a.b, b.b, t) };
}

/**
 * Keeps procedural caches bounded without clearing every derived value in a
 * single hot-path call. Map insertion order gives us a cheap FIFO eviction;
 * all entries are deterministic recomputations, never gameplay state.
 */
function setBoundedCache<K, V>(
	cache: Map<K, V>,
	key: K,
	value: V,
	limit: number,
): void {
	cache.set(key, value);
	if (cache.size <= limit) return;
	const keys = cache.keys();
	for (let count = 0; count < CACHE_EVICTION_BATCH; count++) {
		const next = keys.next();
		if (next.done) break;
		cache.delete(next.value);
	}
}

// Paliers 1-lipschitziens reliés par des rampes procédurales déterministes.
export class World {
	readonly seed: number;
	readonly CELL = 12;
	readonly N = 4;
	readonly STEP = 10;
	readonly TIERS = 8;
	/** The rendered ground is a continuous surface, not a stepped voxel map. */
	readonly isSmoothTerrain = true;
	private readonly terrainBaseHeight = 24;
	private readonly terrainHeightAmplitude = 18;

	private noise: Noise2D;
	private scaleDiv = 22;
	private octaves = 4;
	private contrast = 1.5; // pousse le relief vers les extrêmes
	private rampChance = 40; // % des liaisons valides converties en pente
	private fillR = 3; // rayon de fermeture morpho (rebouche les cuvettes)

	private rawCache = new Map<number, number>();
	private tierCache = new Map<number, number>();
	private dilateCache = new Map<number, number>();
	private closeCache = new Map<number, number>();
	private rampCache = new Map<number, readonly [number, number] | null>();
	/** Corner samples are shared by movement, scenery and neighboring chunks. */
	private surfaceHeightCache = new Map<number, number>();
	/** Four-corner cells avoid four Map lookups for every height query. */
	private surfaceCellCache = new Map<number, SurfaceCellHeights>();
	private topColorCache: WorldColor[] = [];

	constructor(seed: number) {
		this.seed = seed >>> 0;
		this.noise = makeNoise2D(this.seed);
	}

	private raw(wx: number, wz: number): number {
		const sc = 1 / (this.scaleDiv * 8);
		let amp = 1;
		let freq = 1;
		let sum = 0;
		let norm = 0;
		for (let i = 0; i < this.octaves; i++) {
			sum += amp * this.noise(wx * sc * freq, wz * sc * freq);
			norm += amp;
			amp *= 0.5;
			freq *= 2;
		}
		const detail = sum / norm; // détail [-1, 1]
		const macro = this.noise(wx * sc * 0.28, wz * sc * 0.28); // grande échelle
		const e = (0.58 * macro + 0.42 * detail + 1) * 0.5; // 0..1
		return clamp01((e - 0.5) * this.contrast + 0.5);
	}

	private rawTier(gx: number, gz: number): number {
		const k = keyOf(gx, gz);
		const cached = this.rawCache.get(k);
		if (cached !== undefined) return cached;
		let t = Math.floor(
			this.raw(
				gx * this.CELL + this.CELL * 0.5,
				gz * this.CELL + this.CELL * 0.5,
			) * this.TIERS,
		);
		if (t < 0) t = 0;
		else if (t > this.TIERS - 1) t = this.TIERS - 1;
		setBoundedCache(this.rawCache, k, t, RAW_CACHE_LIMIT);
		return t;
	}

	/** Clamp 1-lipschitzien (min de cônes) par anneaux : voisins <= 1 palier. */
	private clamped(gx: number, gz: number): number {
		const k = keyOf(gx, gz);
		const cached = this.tierCache.get(k);
		if (cached !== undefined) return cached;
		let best = this.rawTier(gx, gz);
		const R = this.TIERS - 1;
		for (let r = 1; r <= R && r < best; r++) {
			let m = Infinity;
			for (let dx = -r; dx <= r; dx++) {
				const a = this.rawTier(gx + dx, gz - r);
				const b = this.rawTier(gx + dx, gz + r);
				if (a < m) m = a;
				if (b < m) m = b;
			}
			for (let dz = 1 - r; dz < r; dz++) {
				const a = this.rawTier(gx - r, gz + dz);
				const b = this.rawTier(gx + r, gz + dz);
				if (a < m) m = a;
				if (b < m) m = b;
			}
			if (m + r < best) best = m + r;
		}
		setBoundedCache(this.tierCache, k, best, DERIVED_CACHE_LIMIT);
		return best;
	}

	private dilate(gx: number, gz: number): number {
		const k = keyOf(gx, gz);
		const cached = this.dilateCache.get(k);
		if (cached !== undefined) return cached;
		const r = this.fillR;
		let m = -Infinity;
		for (let dz = -r; dz <= r; dz++)
			for (let dx = -r; dx <= r; dx++) {
				const c = this.clamped(gx + dx, gz + dz);
				if (c > m) m = c;
			}
		setBoundedCache(this.dilateCache, k, m, DERIVED_CACHE_LIMIT);
		return m;
	}

	/** Palier final = fermeture morpho (érosion d'une dilatation). */
	tier(gx: number, gz: number): number {
		if (this.fillR <= 0) return this.clamped(gx, gz);
		const k = keyOf(gx, gz);
		const cached = this.closeCache.get(k);
		if (cached !== undefined) return cached;
		const r = this.fillR;
		let m = Infinity;
		for (let dz = -r; dz <= r; dz++)
			for (let dx = -r; dx <= r; dx++) {
				const c = this.dilate(gx + dx, gz + dz);
				if (c < m) m = c;
			}
		setBoundedCache(this.closeCache, k, m, DERIVED_CACHE_LIMIT);
		return m;
	}

	topColor(T: number): WorldColor {
		const cached = this.topColorCache[T];
		if (cached) return cached;
		const t = this.TIERS <= 1 ? 0 : T / (this.TIERS - 1);
		const color =
			t < 0.6
				? mixC(GRASS, DARK_GRASS, t / 0.6)
				: t < 0.85
					? mixC(DARK_GRASS, ROCK, (t - 0.6) / 0.25)
					: mixC(ROCK, SNOW, (t - 0.85) / 0.15);
		this.topColorCache[T] = color;
		return color;
	}

	private hash(gx: number, gz: number): number {
		let h =
			(Math.imul(gx | 0, 374761393) + Math.imul(gz | 0, 668265263)) ^
			this.seed;
		h = Math.imul(h ^ (h >>> 13), 1274126177);
		return (h ^ (h >>> 16)) >>> 0;
	}

	/** Pente "candidate" : une case montant T->T+1 avec arrière plat T. */
	private slopeCandidate(
		gx: number,
		gz: number,
	): readonly [number, number] | null {
		const T = this.tier(gx, gz);
		let mask = 0;
		let count = 0;
		for (let index = 0; index < DIRS.length; index++) {
			const d = DIRS[index];
			if (
				this.tier(gx + d[0], gz + d[1]) === T + 1 &&
				this.tier(gx - d[0], gz - d[1]) === T
			) {
				mask |= 1 << index;
				count++;
			}
		}
		if (!count) return null;
		const h = this.hash(gx, gz);
		if (h % 100 >= this.rampChance) return null;
		let selected = (h >>> 8) % count;
		for (let index = 0; index < DIRS.length; index++)
			if ((mask & (1 << index)) !== 0 && selected-- === 0)
				return DIRS[index];
		return null;
	}

	/** Pente FINALE : retire les pentes adjacentes de sens différent. */
	rampDir(gx: number, gz: number): readonly [number, number] | null {
		const k = keyOf(gx, gz);
		const cached = this.rampCache.get(k);
		if (cached !== undefined) return cached;
		const d = this.computeRampDir(gx, gz);
		setBoundedCache(this.rampCache, k, d, DERIVED_CACHE_LIMIT);
		return d;
	}

	private computeRampDir(
		gx: number,
		gz: number,
	): readonly [number, number] | null {
		const d = this.slopeCandidate(gx, gz);
		if (!d) return null;
		const h = this.hash(gx, gz);
		for (const n of DIRS) {
			const dn = this.slopeCandidate(gx + n[0], gz + n[1]);
			if (
				dn &&
				(dn[0] !== d[0] || dn[1] !== d[1]) &&
				this.hash(gx + n[0], gz + n[1]) < h
			)
				return null;
		}
		return d;
	}

	/** Smooth source height sampled by the rendered terrain grid. */
	private continuousHeight(wx: number, wz: number): number {
		const broad = this.noise(wx / 180, wz / 180);
		const rolling = this.noise(wx / 72 + 31.7, wz / 72 - 13.1);
		const detail = this.noise(wx / 30 - 7.4, wz / 30 + 11.6);
		const combined = broad * 0.62 + rolling * 0.28 + detail * 0.1;
		const shaped = Math.sign(combined) * Math.pow(Math.abs(combined), 1.25);
		return this.terrainBaseHeight + shaped * this.terrainHeightAmplitude;
	}

	private surfaceCornerHeight(gx: number, gz: number, step: number): number {
		const key = keyOf(gx, gz);
		const cached = this.surfaceHeightCache.get(key);
		if (cached !== undefined) return cached;
		const height = this.continuousHeight(gx * step, gz * step);
		setBoundedCache(
			this.surfaceHeightCache,
			key,
			height,
			DERIVED_CACHE_LIMIT,
		);
		return height;
	}

	private surfaceCellHeights(
		gx: number,
		gz: number,
		step: number,
	): SurfaceCellHeights {
		const key = keyOf(gx, gz);
		const cached = this.surfaceCellCache.get(key);
		if (cached) return cached;
		const cell = {
			h00: this.surfaceCornerHeight(gx, gz, step),
			h10: this.surfaceCornerHeight(gx + 1, gz, step),
			h01: this.surfaceCornerHeight(gx, gz + 1, step),
			h11: this.surfaceCornerHeight(gx + 1, gz + 1, step),
		};
		setBoundedCache(this.surfaceCellCache, key, cell, DERIVED_CACHE_LIMIT);
		return cell;
	}

	/**
	 * Samples height and normal together without evaluating the four terrain
	 * corners twice. The ref form lets render-time callers reuse one object.
	 */
	sampleSurfaceToRef(
		wx: number,
		wz: number,
		result: WorldSurfaceSample,
	): WorldSurfaceSample {
		const step = this.CELL / TERRAIN_SUBDIVISIONS_PER_CELL;
		const gx = Math.floor(wx / step);
		const gz = Math.floor(wz / step);
		const u = wx / step - gx;
		const v = wz / step - gz;
		const { h00, h10, h01, h11 } = this.surfaceCellHeights(gx, gz, step);
		if (u + v <= 1) {
			result.height = h00 + (h10 - h00) * u + (h01 - h00) * v;
			const nx = -step * (h10 - h00);
			const nz = -step * (h01 - h00);
			const length = Math.hypot(nx, step * step, nz);
			result.x = nx / length;
			result.y = (step * step) / length;
			result.z = nz / length;
		} else {
			result.height = h10 * (1 - v) + h01 * (1 - u) + h11 * (u + v - 1);
			const nx = step * (h01 - h11);
			const nz = -step * (h11 - h10);
			const length = Math.hypot(nx, step * step, nz);
			result.x = nx / length;
			result.y = (step * step) / length;
			result.z = nz / length;
		}
		return result;
	}

	sampleSurface(wx: number, wz: number): WorldSurfaceSample {
		return this.sampleSurfaceToRef(wx, wz, {
			height: 0,
			x: 0,
			y: 1,
			z: 0,
		});
	}

	/**
	 * Height of the actual continuous terrain mesh at a world position.
	 *
	 * The renderer triangulates each 3-unit grid cell along the same diagonal,
	 * so sampling that triangle here keeps gameplay and scenery exactly on the
	 * visible surface instead of relying on an approximate offset.
	 */
	height(wx: number, wz: number): number {
		const step = this.CELL / TERRAIN_SUBDIVISIONS_PER_CELL;
		const gx = Math.floor(wx / step);
		const gz = Math.floor(wz / step);
		const u = wx / step - gx;
		const v = wz / step - gz;
		const { h00, h10, h01, h11 } = this.surfaceCellHeights(gx, gz, step);
		if (u + v <= 1) return h00 + (h10 - h00) * u + (h01 - h00) * v;
		return h10 * (1 - v) + h01 * (1 - u) + h11 * (u + v - 1);
	}

	/** Exact upward normal of the rendered triangle under a world position. */
	groundNormal(wx: number, wz: number): WorldNormal {
		const step = this.CELL / TERRAIN_SUBDIVISIONS_PER_CELL;
		const gx = Math.floor(wx / step);
		const gz = Math.floor(wz / step);
		const u = wx / step - gx;
		const v = wz / step - gz;
		const { h00, h10, h01, h11 } = this.surfaceCellHeights(gx, gz, step);
		let nx: number;
		let ny = step * step;
		let nz: number;
		if (u + v <= 1) {
			nx = -step * (h10 - h00);
			nz = -step * (h01 - h00);
		} else {
			nx = step * (h01 - h11);
			nz = -step * (h11 - h10);
		}
		const length = Math.hypot(nx, ny, nz);
		return { x: nx / length, y: ny / length, z: nz / length };
	}
}

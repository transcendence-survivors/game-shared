import { BOSS_KINDS, MONSTER_KINDS } from '../utils/Constants';
import type { BossKind, MonsterAnimState, MonsterKind } from '../utils/Types';

export const DEFAULT_MONSTER_HITBOX_RADIUS = 0.75;
export const DEFAULT_MONSTER_HITBOX_HEIGHT = 2;
export const DEFAULT_MONSTER_HITBOX_OFFSET_Y = 1;
export const DEFAULT_MONSTER_HITBOX_OFFSET_X = 0;
export const DEFAULT_MONSTER_HITBOX_OFFSET_Z = 0;
export const BOSS_MODEL_SCALE = 2.5;

export interface MonsterHitboxDimensions {
	radius: number;
	height: number;
	offsetX: number;
	offsetY: number;
	offsetZ: number;
}

export interface MonsterHitboxPrimitive {
	shape: 'sphere' | 'cylinder';
	role: 'lower' | 'torso' | 'head';
	offsetX: number;
	offsetY: number;
	offsetZ: number;
	radius: number;
	height: number;
}

const cylinder = (
	role: MonsterHitboxPrimitive['role'],
	offsetX: number,
	offsetY: number,
	offsetZ: number,
	radius: number,
	height: number,
): MonsterHitboxPrimitive => ({
	shape: 'cylinder',
	role,
	offsetX,
	offsetY,
	offsetZ,
	radius,
	height,
});

type MonsterBounds = readonly [
	radius: number,
	height: number,
	offsetX: number,
	offsetY: number,
	offsetZ: number,
];
type MonsterProfile = {
	bounds: MonsterBounds;
	parts: readonly MonsterHitboxPrimitive[];
};
type KnownKind = MonsterKind | BossKind;

export const MONSTER_HITBOX_PROFILES = {
	skitter: { bounds: [2.593, 2.152, -0.706, 1.485, 0.201], parts: [
		cylinder('lower', 0, 0.42, 0.1, 2.15, 0.64),
		cylinder('torso', 0.07, 1.3, 1.32, 0.92, 1.35),
		cylinder('head', 0.07, 1.44, 2.18, 0.5, 1),
	] },
	venomweb: { bounds: [3.046, 2.938, 0.688, 2.131, 0.945], parts: [
		cylinder('lower', 0, 0.54, 0.15, 2.45, 0.8),
		cylinder('torso', 0.05, 1.55, 1.3, 0.72, 1.25),
		cylinder('head', 0.1, 1.83, 2.66, 0.9, 1.45),
	] },
	grunt: { bounds: [1.744, 2.831, -0.239, 2.17, -0.214], parts: [
		cylinder('lower', 0, 0.82, 0, 0.72, 1.55),
		cylinder('torso', 0.03, 2.03, 0.03, 1.18, 1.65),
		cylinder('head', 0.1, 3.2, 0.33, 0.58, 1.1),
	] },
	ravager: { bounds: [1.873, 8.013, 0.032, 4.108, 0.354], parts: [
		cylinder('lower', 0, 1.45, 0, 0.72, 2.8),
		cylinder('torso', 0.06, 4.15, 0.2, 0.88, 3.35),
		cylinder('head', 0.11, 6.66, 1.48, 0.82, 1.55),
	] },
	kraklet: { bounds: [3.583, 5.536, 0.502, 4.241, 0.669], parts: [
		cylinder('lower', 0, 1.42, 0, 0.75, 2.75),
		cylinder('torso', 0.06, 3.95, 0.2, 0.9, 3.1),
		cylinder('head', 0.1, 6.08, 0.55, 1.08, 1.85),
	] },
	arakhnos: { bounds: [7.603, 8.448, -3.429, 2.317, 2.465], parts: [
		cylinder('lower', 0, 0.8, 0.4, 6.1, 1.35),
		cylinder('torso', 0, 2.85, 2.5, 2.55, 4.25),
		cylinder('head', 0.07, 2.91, 7.03, 1.25, 2.3),
	] },
	gorvath: { bounds: [5.123, 12.233, -0.068, 5.116, 0.299], parts: [
		cylinder('lower', 0, 1.75, 0, 2.65, 3.4),
		cylinder('torso', 0.03, 5.4, 0.19, 3.75, 4.9),
		cylinder('head', 0.11, 8.72, 1.56, 1.3, 2.35),
	] },
	khimaera: { bounds: [14.034, 11.911, -0.229, 5.261, -1.241], parts: [
		cylinder('lower', 0, 1.7, 0, 4.8, 3.2),
		cylinder('torso', 0.03, 5.8, 0.48, 4.5, 5.8),
		cylinder('head', 0.06, 9.05, 2.95, 1.8, 3.15),
	] },
	abyssor: { bounds: [10.342, 15.076, 0.307, 6.482, 1.243], parts: [
		cylinder('lower', -0.15, 1.9, -2.6, 5.7, 3.6),
		cylinder('torso', 0.03, 6.25, 0.01, 5.55, 6.3),
		cylinder('head', 0.07, 11.1, 0.04, 1.9, 3.5),
	] },
} as const satisfies Readonly<Record<KnownKind, MonsterProfile>>;

const KNOWN_KINDS = new Set<string>([...MONSTER_KINDS, ...BOSS_KINDS]);

export function getMonsterHitboxRadius(kind: string, isBoss: boolean): number {
	if (!KNOWN_KINDS.has(kind)) return DEFAULT_MONSTER_HITBOX_RADIUS;
	const radius = MONSTER_HITBOX_PROFILES[kind as KnownKind].bounds[0];
	return radius * (isBoss ? BOSS_MODEL_SCALE : 1);
}

export function getMonsterCompoundHitboxes(
	kind: string,
	isBoss: boolean,
	animState: MonsterAnimState = 'idle',
	animationTimeS = 0,
): readonly MonsterHitboxPrimitive[] {
	if (!KNOWN_KINDS.has(kind))
		return [
			cylinder(
				'torso',
				0,
				DEFAULT_MONSTER_HITBOX_OFFSET_Y,
				0,
				DEFAULT_MONSTER_HITBOX_RADIUS,
				DEFAULT_MONSTER_HITBOX_HEIGHT,
			),
		];
	const scale = isBoss ? BOSS_MODEL_SCALE : 1;
	return MONSTER_HITBOX_PROFILES[kind as KnownKind].parts.map(
		(part) => poseMonsterHitboxPart(part, scale, animState, animationTimeS),
	);
}

/** Pose legere et deterministe partagee par la collision serveur et le debug. */
function poseMonsterHitboxPart(
	part: MonsterHitboxPrimitive,
	scale: number,
	animState: MonsterAnimState,
	timeS: number,
): MonsterHitboxPrimitive {
	const safeTime = Number.isFinite(timeS) ? timeS : 0;
	let swayX = 0;
	let bobY = 0;
	let leanZ = 0;
	if (animState === 'walk') {
		const gait = Math.sin(safeTime * 7);
		const bob = Math.abs(Math.cos(safeTime * 7));
		swayX = gait * part.radius * (part.role === 'lower' ? 0.025 : 0.07);
		bobY = bob * part.height * (part.role === 'lower' ? 0.015 : 0.035);
		leanZ = part.role === 'head' ? part.radius * 0.08 : 0;
	} else if (animState === 'attack') {
		const strike = 0.5 + 0.5 * Math.sin(safeTime * 5);
		leanZ =
			strike *
			part.radius *
			(part.role === 'head' ? 0.38 : part.role === 'torso' ? 0.18 : 0.03);
		bobY = -strike * part.height * (part.role === 'head' ? 0.035 : 0.015);
	} else if (part.role !== 'lower') {
		bobY = Math.sin(safeTime * 2.2) * part.height * 0.012;
	}
	return {
		...part,
		offsetX: (part.offsetX + swayX) * scale,
		offsetY: (part.offsetY + bobY) * scale,
		offsetZ: (part.offsetZ + leanZ) * scale,
		radius: part.radius * scale,
		height: part.height * scale,
	};
}

export function getMonsterHitbox(
	kind: string,
	isBoss: boolean,
): MonsterHitboxDimensions {
	if (!KNOWN_KINDS.has(kind))
		return {
			radius: DEFAULT_MONSTER_HITBOX_RADIUS,
			height: DEFAULT_MONSTER_HITBOX_HEIGHT,
			offsetX: DEFAULT_MONSTER_HITBOX_OFFSET_X,
			offsetY: DEFAULT_MONSTER_HITBOX_OFFSET_Y,
			offsetZ: DEFAULT_MONSTER_HITBOX_OFFSET_Z,
		};
	const [radius, height, offsetX, offsetY, offsetZ] =
		MONSTER_HITBOX_PROFILES[kind as KnownKind].bounds;
	const scale = isBoss ? BOSS_MODEL_SCALE : 1;
	return {
		radius: radius * scale,
		height: height * scale,
		offsetX: offsetX * scale,
		offsetY: offsetY * scale,
		offsetZ: offsetZ * scale,
	};
}

import type { BossKind, MonsterAnimState, MonsterKind } from '../utils/Types';

export const DEFAULT_MONSTER_HITBOX_RADIUS = 0.75;
export const DEFAULT_MONSTER_HITBOX_HEIGHT = 2;
export const DEFAULT_MONSTER_HITBOX_OFFSET_Y = 1;
export const DEFAULT_MONSTER_HITBOX_OFFSET_X = 0;
export const DEFAULT_MONSTER_HITBOX_OFFSET_Z = 0;
export const MONSTER_MODEL_SCALE = 0.5;
export const BOSS_MODEL_SCALE = 4;
/** Elites are deliberately unmistakable in the crowd. */
export const ELITE_MODEL_SCALE = 2;

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

const FALLBACK_PART = cylinder(
	'torso',
	0,
	DEFAULT_MONSTER_HITBOX_OFFSET_Y,
	0,
	DEFAULT_MONSTER_HITBOX_RADIUS,
	DEFAULT_MONSTER_HITBOX_HEIGHT,
);
const FALLBACK_PARTS = [FALLBACK_PART] as const;

type MonsterBounds = readonly [
	radius: number,
	height: number,
	offsetX: number,
	offsetY: number,
	offsetZ: number,
];
const FALLBACK_BOUNDS: MonsterBounds = [
	DEFAULT_MONSTER_HITBOX_RADIUS,
	DEFAULT_MONSTER_HITBOX_HEIGHT,
	DEFAULT_MONSTER_HITBOX_OFFSET_X,
	DEFAULT_MONSTER_HITBOX_OFFSET_Y,
	DEFAULT_MONSTER_HITBOX_OFFSET_Z,
];
type MonsterProfile = {
	bounds: MonsterBounds;
	parts: readonly MonsterHitboxPrimitive[];
};
type KnownKind = MonsterKind | BossKind;

// These are the unscaled bind-pose bounds of the selected Ultimate Monsters
// GLBs. Boss profiles describe their Big source model; the shared boss scale
// below is applied consistently by both render and collision code.
export const MONSTER_HITBOX_PROFILES = {
	skitter: {
		bounds: [1.202, 1.869, 0.076, 0.922, 0.13],
		parts: [
			cylinder('lower', 0.076, 0.324, 0.13, 0.865, 0.673),
			cylinder('torso', 0.076, 0.922, 0.13, 1.105, 1.121),
			cylinder('head', 0.076, 1.52, 0.13, 0.817, 0.673),
		],
	},
	venomweb: {
		bounds: [2.119, 4.159, 0, 2.027, -0.074],
		parts: [
			cylinder('lower', 0, 0.696, -0.074, 1.525, 1.497),
			cylinder('torso', 0, 2.027, -0.074, 1.949, 2.496),
			cylinder('head', 0, 3.358, -0.074, 1.441, 1.497),
		],
	},
	grunt: {
		bounds: [1.068, 1.814, 0, 0.89, 0.063],
		parts: [
			cylinder('lower', 0, 0.31, 0.063, 0.769, 0.653),
			cylinder('torso', 0, 0.89, 0.063, 0.982, 1.088),
			cylinder('head', 0, 1.471, 0.063, 0.726, 0.653),
		],
	},
	ravager: {
		bounds: [1.485, 2.987, 0.086, 1.425, 0.071],
		parts: [
			cylinder('lower', 0.086, 0.469, 0.071, 1.069, 1.075),
			cylinder('torso', 0.086, 1.425, 0.071, 1.366, 1.792),
			cylinder('head', 0.086, 2.381, 0.071, 1.01, 1.075),
		],
	},
	kraklet: {
		bounds: [2.151, 3.494, -0.056, 1.747, 0.391],
		parts: [
			cylinder('lower', -0.056, 0.629, 0.391, 1.549, 1.258),
			cylinder('torso', -0.056, 1.747, 0.391, 1.979, 2.097),
			cylinder('head', -0.056, 2.865, 0.391, 1.463, 1.258),
		],
	},
	bomber: {
		bounds: [1.12, 1.9, 0, 0.94, 0.05],
		parts: [
			cylinder('lower', 0, 0.32, 0.05, 0.8, 0.68),
			cylinder('torso', 0, 0.94, 0.05, 1.03, 1.14),
			cylinder('head', 0, 1.55, 0.05, 0.77, 0.68),
		],
	},
	splitter: {
		bounds: [1.34, 2.05, 0, 1.02, 0.08],
		parts: [
			cylinder('lower', 0, 0.36, 0.08, 0.96, 0.75),
			cylinder('torso', 0, 1.02, 0.08, 1.24, 1.25),
			cylinder('head', 0, 1.68, 0.08, 0.91, 0.75),
		],
	},
	necromancer: {
		bounds: [1.28, 2.65, 0.06, 1.25, 0.06],
		parts: [
			cylinder('lower', 0.06, 0.42, 0.06, 0.92, 0.96),
			cylinder('torso', 0.06, 1.25, 0.06, 1.22, 1.6),
			cylinder('head', 0.06, 2.15, 0.06, 0.9, 1.0),
		],
	},
	wisp: {
		bounds: [0.82, 1.45, 0, 0.72, 0],
		parts: [
			cylinder('lower', 0, 0.24, 0, 0.6, 0.48),
			cylinder('torso', 0, 0.72, 0, 0.78, 0.8),
			cylinder('head', 0, 1.16, 0, 0.56, 0.48),
		],
	},
	brute: {
		bounds: [1.46, 2.45, 0, 1.2, 0.06],
		parts: [
			cylinder('lower', 0, 0.43, 0.06, 1.08, 0.88),
			cylinder('torso', 0, 1.2, 0.06, 1.38, 1.46),
			cylinder('head', 0, 2.0, 0.06, 1.02, 0.88),
		],
	},
	arakhnos: {
		bounds: [2.344, 3.268, 0, 1.621, 0.28],
		parts: [
			cylinder('lower', 0, 0.575, 0.28, 1.688, 1.176),
			cylinder('torso', 0, 1.621, 0.28, 2.156, 1.961),
			cylinder('head', 0, 2.666, 0.28, 1.594, 1.176),
		],
	},
	gorvath: {
		bounds: [2.325, 2.828, 0, 1.403, 0.091],
		parts: [
			cylinder('lower', 0, 0.498, 0.091, 1.674, 1.018),
			cylinder('torso', 0, 1.403, 0.091, 2.139, 1.697),
			cylinder('head', 0, 2.308, 0.091, 1.581, 1.018),
		],
	},
	khimaera: {
		bounds: [2.328, 3.12, 0, 1.545, -0.17],
		parts: [
			cylinder('lower', 0, 0.546, -0.17, 1.676, 1.123),
			cylinder('torso', 0, 1.545, -0.17, 2.142, 1.872),
			cylinder('head', 0, 2.543, -0.17, 1.583, 1.123),
		],
	},
	abyssor: {
		bounds: [2.324, 3.609, 0, 1.794, 0.151],
		parts: [
			cylinder('lower', 0, 0.639, 0.151, 1.673, 1.299),
			cylinder('torso', 0, 1.794, 0.151, 2.138, 2.165),
			cylinder('head', 0, 2.948, 0.151, 1.58, 1.299),
		],
	},
} as const satisfies Readonly<Record<KnownKind, MonsterProfile>>;

const isKnownKind = (kind: string): kind is KnownKind =>
	Object.hasOwn(MONSTER_HITBOX_PROFILES, kind);

export function getMonsterCompoundHitboxes(
	kind: string,
	isBoss: boolean,
	animState: MonsterAnimState = 'idle',
	animationTimeS = 0,
	output: MonsterHitboxPrimitive[] = [],
	sizeMultiplier = 1,
): MonsterHitboxPrimitive[] {
	const parts = isKnownKind(kind)
		? MONSTER_HITBOX_PROFILES[kind].parts
		: FALLBACK_PARTS;
	const scale =
		MONSTER_MODEL_SCALE *
		(isBoss ? BOSS_MODEL_SCALE : 1) *
		(Math.max(0.25, Number.isFinite(sizeMultiplier) ? sizeMultiplier : 1));
	output.length = parts.length;
	for (let index = 0; index < parts.length; index++)
		output[index] = poseMonsterHitboxPart(
			parts[index],
			scale,
			animState,
			animationTimeS,
			output[index],
		);
	return output;
}

function poseMonsterHitboxPart(
	part: MonsterHitboxPrimitive,
	scale: number,
	animState: MonsterAnimState,
	timeS: number,
	output?: MonsterHitboxPrimitive,
): MonsterHitboxPrimitive {
	const safeTime = Number.isFinite(timeS) ? timeS : 0;
	let swayX = 0;
	let bobY = 0;
	let leanZ = 0;
	if (animState === 'walk') {
		const gaitPhase = safeTime * 7;
		const gait = Math.sin(gaitPhase);
		const bob = Math.abs(Math.cos(gaitPhase));
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
	const posed = output ?? { ...part };
	posed.shape = part.shape;
	posed.role = part.role;
	posed.offsetX = (part.offsetX + swayX) * scale;
	posed.offsetY = (part.offsetY + bobY) * scale;
	posed.offsetZ = (part.offsetZ + leanZ) * scale;
	posed.radius = part.radius * scale;
	posed.height = part.height * scale;
	return posed;
}

export function getMonsterHitbox(
	kind: string,
	isBoss: boolean,
	sizeMultiplier = 1,
) {
	const [radius, height, offsetX, offsetY, offsetZ] = isKnownKind(kind)
		? MONSTER_HITBOX_PROFILES[kind].bounds
		: FALLBACK_BOUNDS;
	const scale =
		MONSTER_MODEL_SCALE *
		(isBoss ? BOSS_MODEL_SCALE : 1) *
		(Math.max(0.25, Number.isFinite(sizeMultiplier) ? sizeMultiplier : 1));
	return {
		radius: radius * scale,
		height: height * scale,
		offsetX: offsetX * scale,
		offsetY: offsetY * scale,
		offsetZ: offsetZ * scale,
	};
}

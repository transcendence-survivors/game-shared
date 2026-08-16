import { isCircleInSector } from './CombatGeometry';
import {
	MONSTER_HITBOX_PROFILES,
	getMonsterCompoundHitboxes,
} from './MonsterHitboxes';
import type { MonsterAnimState } from '../utils/Types';

export interface Vec3Like {
	x: number;
	y: number;
	z: number;
}
export interface VerticalCylinder extends Vec3Like {
	radius: number;
	height: number;
}
export type MonsterWorldHitbox =
	| (Vec3Like & { shape: 'sphere'; radius: number })
	| (VerticalCylinder & { shape: 'cylinder' });

export interface MonsterCylinderSource extends Vec3Like {
	kind: string;
	isBoss: boolean;
	rotationY: number;
	hitboxRadius: number;
	hitboxHeight: number;
	hitboxOffsetX: number;
	hitboxOffsetY: number;
	hitboxOffsetZ: number;
	animState?: MonsterAnimState;
}

function localHitboxCenter(
	monster: Pick<MonsterCylinderSource, 'x' | 'y' | 'z' | 'rotationY'>,
	offsetX: number,
	offsetY: number,
	offsetZ: number,
): Vec3Like {
	// Les offsets GLB sont déjà exprimés dans le repère visuel retourné :
	// ne pas leur réappliquer le demi-tour utilisé pour orienter le modèle.
	const angle = monster.rotationY;
	const sin = Math.sin(angle);
	const cos = Math.cos(angle);
	return {
		x: monster.x + offsetX * cos + offsetZ * sin,
		y: monster.y + offsetY,
		z: monster.z + offsetZ * cos - offsetX * sin,
	};
}

/** Cylindre de secours transformé dans le même repère que le modèle visible. */
export function monsterHitboxCylinder(
	monster: MonsterCylinderSource,
): VerticalCylinder {
	const center = localHitboxCenter(
		monster,
		monster.hitboxOffsetX,
		monster.hitboxOffsetY,
		monster.hitboxOffsetZ,
	);
	return {
		...center,
		radius: monster.hitboxRadius,
		height: monster.hitboxHeight,
	};
}

/** Volumes corporels locaux transformés dans le monde; une sphère garde hauteur = diamètre. */
export function monsterHitboxCylinders(
	monster: MonsterCylinderSource,
	animationTimeS = 0,
): VerticalCylinder[] {
	if (!Object.hasOwn(MONSTER_HITBOX_PROFILES, monster.kind))
		return [monsterHitboxCylinder(monster)];
	return getMonsterCompoundHitboxes(
		monster.kind,
		monster.isBoss,
		monster.animState,
		animationTimeS,
	).map((part) => ({
		...localHitboxCenter(monster, part.offsetX, part.offsetY, part.offsetZ),
		radius: part.radius,
		height: part.height,
	}));
}

export function monsterHitboxPrimitives(
	monster: MonsterCylinderSource,
	animationTimeS = 0,
): MonsterWorldHitbox[] {
	if (!Object.hasOwn(MONSTER_HITBOX_PROFILES, monster.kind))
		return [{ ...monsterHitboxCylinder(monster), shape: 'cylinder' }];
	return getMonsterCompoundHitboxes(
		monster.kind,
		monster.isBoss,
		monster.animState,
		animationTimeS,
	).map((part) => ({
		...localHitboxCenter(monster, part.offsetX, part.offsetY, part.offsetZ),
		shape: part.shape,
		radius: part.radius,
		...(part.shape === 'cylinder' ? { height: part.height } : {}),
	})) as MonsterWorldHitbox[];
}

function verticalOverlap(
	aY: number,
	aHeight: number,
	bY: number,
	bHeight: number,
) {
	return Math.abs(aY - bY) <= (aHeight + bHeight) / 2;
}

export function doVerticalCylindersIntersect(
	a: VerticalCylinder,
	b: VerticalCylinder,
): boolean {
	const dx = a.x - b.x;
	const dz = a.z - b.z;
	return (
		verticalOverlap(a.y, a.height, b.y, b.height) &&
		dx * dx + dz * dz <= (a.radius + b.radius) ** 2
	);
}

export function doesSphereHitVerticalCylinder(
	sphere: Vec3Like & { radius: number },
	cylinder: VerticalCylinder,
): boolean {
	const dx = sphere.x - cylinder.x;
	const dz = sphere.z - cylinder.z;
	const radialGap = Math.max(0, Math.hypot(dx, dz) - cylinder.radius);
	const verticalGap = Math.max(
		0,
		Math.abs(sphere.y - cylinder.y) - cylinder.height / 2,
	);
	return radialGap ** 2 + verticalGap ** 2 <= sphere.radius ** 2;
}

export function doesMovingSphereHitVerticalCylinder(
	start: Vec3Like,
	end: Vec3Like,
	radius: number,
	cylinder: VerticalCylinder,
): boolean {
	const vx = end.x - start.x;
	const vy = end.y - start.y;
	const vz = end.z - start.z;
	const length2 = vx * vx + vy * vy + vz * vz;
	const t =
		length2 <= Number.EPSILON
			? 0
			: Math.max(
					0,
					Math.min(
						1,
						((cylinder.x - start.x) * vx +
							(cylinder.y - start.y) * vy +
							(cylinder.z - start.z) * vz) /
							length2,
					),
				);
	return (
		doesSphereHitVerticalCylinder(
			{
				x: start.x + vx * t,
				y: start.y + vy * t,
				z: start.z + vz * t,
				radius,
			},
			cylinder,
		) ||
		doesSphereHitVerticalCylinder({ ...start, radius }, cylinder) ||
		doesSphereHitVerticalCylinder({ ...end, radius }, cylinder)
	);
}

export function doesMovingSphereHitSphere(
	start: Vec3Like,
	end: Vec3Like,
	movingRadius: number,
	target: Vec3Like & { radius: number },
): boolean {
	const vx = end.x - start.x;
	const vy = end.y - start.y;
	const vz = end.z - start.z;
	const length2 = vx * vx + vy * vy + vz * vz;
	const t =
		length2 <= Number.EPSILON
			? 0
			: Math.max(
					0,
					Math.min(
						1,
						((target.x - start.x) * vx +
							(target.y - start.y) * vy +
							(target.z - start.z) * vz) /
							length2,
					),
				);
	const dx = start.x + vx * t - target.x;
	const dy = start.y + vy * t - target.y;
	const dz = start.z + vz * t - target.z;
	return dx * dx + dy * dy + dz * dz <= (movingRadius + target.radius) ** 2;
}

export function doesSweptBoxHitVerticalCylinder(
	start: Vec3Like,
	end: Vec3Like,
	width: number,
	height: number,
	depth: number,
	directionX: number,
	directionZ: number,
	cylinder: VerticalCylinder,
): boolean {
	if (
		!verticalOverlap(
			(start.y + end.y) / 2,
			height + Math.abs(end.y - start.y),
			cylinder.y,
			cylinder.height,
		)
	)
		return false;
	const length = Math.hypot(directionX, directionZ) || 1;
	const fx = directionX / length;
	const fz = directionZ / length;
	const rx = fz;
	const rz = -fx;
	const centerX = (start.x + end.x) / 2;
	const centerZ = (start.z + end.z) / 2;
	const along = Math.abs(
		(cylinder.x - centerX) * fx + (cylinder.z - centerZ) * fz,
	);
	const across = Math.abs(
		(cylinder.x - centerX) * rx + (cylinder.z - centerZ) * rz,
	);
	return (
		along <=
			(depth + Math.hypot(end.x - start.x, end.z - start.z)) / 2 +
				cylinder.radius && across <= width / 2 + cylinder.radius
	);
}

export function doesSweptBoxHitSphere(
	start: Vec3Like,
	end: Vec3Like,
	width: number,
	height: number,
	depth: number,
	directionX: number,
	directionZ: number,
	sphere: Vec3Like & { radius: number },
): boolean {
	const length = Math.hypot(directionX, directionZ) || 1;
	const fx = directionX / length;
	const fz = directionZ / length;
	const rx = fz;
	const rz = -fx;
	const centerX = (start.x + end.x) / 2;
	const centerY = (start.y + end.y) / 2;
	const centerZ = (start.z + end.z) / 2;
	const localX = (sphere.x - centerX) * rx + (sphere.z - centerZ) * rz;
	const localZ = (sphere.x - centerX) * fx + (sphere.z - centerZ) * fz;
	const localY = sphere.y - centerY;
	const halfX = width / 2;
	const halfY = (height + Math.abs(end.y - start.y)) / 2;
	const halfZ = (depth + Math.hypot(end.x - start.x, end.z - start.z)) / 2;
	const dx = Math.max(0, Math.abs(localX) - halfX);
	const dy = Math.max(0, Math.abs(localY) - halfY);
	const dz = Math.max(0, Math.abs(localZ) - halfZ);
	return dx * dx + dy * dy + dz * dz <= sphere.radius ** 2;
}

export function doesHalfCylinderHitVerticalCylinder(
	sector: VerticalCylinder & { rotationY: number; halfAngle: number },
	target: VerticalCylinder,
): boolean {
	return (
		verticalOverlap(sector.y, sector.height, target.y, target.height) &&
		isCircleInSector(
			target,
			target.radius,
			sector,
			sector.rotationY,
			sector.radius,
			sector.halfAngle,
		)
	);
}

export function doesHalfCylinderHitSphere(
	sector: VerticalCylinder & { rotationY: number; halfAngle: number },
	sphere: Vec3Like & { radius: number },
): boolean {
	const verticalGap = Math.max(
		0,
		Math.abs(sphere.y - sector.y) - sector.height / 2,
	);
	if (verticalGap > sphere.radius) return false;
	const horizontalRadius = Math.sqrt(sphere.radius ** 2 - verticalGap ** 2);
	return isCircleInSector(
		sphere,
		horizontalRadius,
		sector,
		sector.rotationY,
		sector.radius,
		sector.halfAngle,
	);
}

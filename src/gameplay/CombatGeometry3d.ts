import { isCircleInSector } from './CombatGeometry';
import {
	MONSTER_HITBOX_PROFILES,
	getMonsterCompoundHitboxes,
	type MonsterHitboxPrimitive,
} from './MonsterHitboxes';
import type { MonsterAnimState, Vec3d } from '../utils/Types';

export type Vec3Like = Vec3d;
export interface VerticalCylinder extends Vec3Like {
	radius: number;
	height: number;
}
export type MonsterWorldHitbox =
	| (Vec3Like & { shape: 'sphere'; radius: number })
	| (VerticalCylinder & { shape: 'cylinder' });
type HitboxBuffer = Vec3Like & {
	shape: MonsterWorldHitbox['shape'];
	radius: number;
	height?: number;
};

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
	animStartedAtS?: number;
	sizeMultiplier?: number;
}

export function monsterHitboxPrimitives(
	monster: MonsterCylinderSource,
	animationTimeS = 0,
	output: MonsterWorldHitbox[] = [],
	posedParts: MonsterHitboxPrimitive[] = [],
	transform?: Pick<MonsterCylinderSource, 'x' | 'y' | 'z' | 'rotationY'>,
): MonsterWorldHitbox[] {
	if (!Object.hasOwn(MONSTER_HITBOX_PROFILES, monster.kind))
		return writeFallbackMonsterHitbox(monster, output, transform);
	getMonsterCompoundHitboxes(
		monster.kind,
		monster.isBoss,
		monster.animState ?? 'idle',
		Math.max(0, animationTimeS - (monster.animStartedAtS ?? 0)),
		posedParts,
		monster.sizeMultiplier ?? 1,
	);
	output.length = posedParts.length;
	const position = transform ?? monster;
	const angle = position.rotationY;
	const sin = Math.sin(angle);
	const cos = Math.cos(angle);
	for (let index = 0; index < posedParts.length; index++) {
		const part = posedParts[index];
		const x = position.x + part.offsetX * cos + part.offsetZ * sin;
		const y = position.y + part.offsetY;
		const z = position.z + part.offsetZ * cos - part.offsetX * sin;
		writeWorldHitbox(
			output,
			index,
			part.shape,
			x,
			y,
			z,
			part.radius,
			part.shape === 'cylinder' ? part.height : undefined,
		);
	}
	return output;
}

function writeFallbackMonsterHitbox(
	monster: MonsterCylinderSource,
	output: MonsterWorldHitbox[],
	transform?: Pick<MonsterCylinderSource, 'x' | 'y' | 'z' | 'rotationY'>,
): MonsterWorldHitbox[] {
	const position = transform ?? monster;
	const sin = Math.sin(position.rotationY);
	const cos = Math.cos(position.rotationY);
	output.length = 1;
	writeWorldHitbox(
		output,
		0,
		'cylinder',
		position.x + monster.hitboxOffsetX * cos + monster.hitboxOffsetZ * sin,
		position.y + monster.hitboxOffsetY,
		position.z + monster.hitboxOffsetZ * cos - monster.hitboxOffsetX * sin,
		monster.hitboxRadius,
		monster.hitboxHeight,
	);
	return output;
}

function writeWorldHitbox(
	output: MonsterWorldHitbox[],
	index: number,
	shape: MonsterWorldHitbox['shape'],
	x: number,
	y: number,
	z: number,
	radius: number,
	height?: number,
): void {
	const target = (output[index] ?? {}) as HitboxBuffer;
	target.shape = shape;
	target.x = x;
	target.y = y;
	target.z = z;
	target.radius = radius;
	if (height === undefined) delete target.height;
	else target.height = height;
	output[index] = target as MonsterWorldHitbox;
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
	return doesSphereHitVerticalCylinderAt(
		sphere.x,
		sphere.y,
		sphere.z,
		sphere.radius,
		cylinder,
	);
}

function doesSphereHitVerticalCylinderAt(
	x: number,
	y: number,
	z: number,
	radius: number,
	cylinder: VerticalCylinder,
): boolean {
	const dx = x - cylinder.x;
	const dz = z - cylinder.z;
	const radialGap = Math.max(0, Math.hypot(dx, dz) - cylinder.radius);
	const verticalGap = Math.max(
		0,
		Math.abs(y - cylinder.y) - cylinder.height / 2,
	);
	return radialGap ** 2 + verticalGap ** 2 <= radius ** 2;
}

export function doesVerticalCylinderHitMonsterPart(
	cylinder: VerticalCylinder,
	target: MonsterWorldHitbox,
): boolean {
	return target.shape === 'sphere'
		? doesSphereHitVerticalCylinder(target, cylinder)
		: doVerticalCylindersIntersect(cylinder, target);
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
	const t = closestSegmentParameter(start, vx, vy, vz, cylinder);
	return (
		doesSphereHitVerticalCylinderAt(
			start.x + vx * t,
			start.y + vy * t,
			start.z + vz * t,
			radius,
			cylinder,
		) ||
		doesSphereHitVerticalCylinderAt(
			start.x,
			start.y,
			start.z,
			radius,
			cylinder,
		) ||
		doesSphereHitVerticalCylinderAt(end.x, end.y, end.z, radius, cylinder)
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
	const t = closestSegmentParameter(start, vx, vy, vz, target);
	const dx = start.x + vx * t - target.x;
	const dy = start.y + vy * t - target.y;
	const dz = start.z + vz * t - target.z;
	return dx * dx + dy * dy + dz * dz <= (movingRadius + target.radius) ** 2;
}

function closestSegmentParameter(
	start: Vec3Like,
	vx: number,
	vy: number,
	vz: number,
	target: Vec3Like,
): number {
	const length2 = vx * vx + vy * vy + vz * vz;
	return length2 <= Number.EPSILON
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

export function doesHalfCylinderHitMonsterPart(
	sector: VerticalCylinder & { rotationY: number; halfAngle: number },
	target: MonsterWorldHitbox,
): boolean {
	return target.shape === 'sphere'
		? doesHalfCylinderHitSphere(sector, target)
		: doesHalfCylinderHitVerticalCylinder(sector, target);
}

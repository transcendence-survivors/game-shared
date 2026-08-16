import { describe, expect, test } from 'vitest';
import {
	doVerticalCylindersIntersect,
	doesHalfCylinderHitVerticalCylinder,
	doesHalfCylinderHitSphere,
	doesMovingSphereHitSphere,
	doesMovingSphereHitVerticalCylinder,
	doesSweptBoxHitVerticalCylinder,
	monsterHitboxCylinder,
} from './CombatGeometry3d';

const monster = { x: 0, y: 1, z: 0, radius: 1, height: 2 };

describe('3D combat geometry', () => {
	test('cylinders require horizontal and vertical overlap', () => {
		expect(
			doVerticalCylindersIntersect(monster, { ...monster, x: 1.5 }),
		).toBe(true);
		expect(
			doVerticalCylindersIntersect(monster, { ...monster, y: 4 }),
		).toBe(false);
	});

	test('a moving sphere can pass above a monster', () => {
		expect(
			doesMovingSphereHitVerticalCylinder(
				{ x: -2, y: 5, z: 0 },
				{ x: 2, y: 5, z: 0 },
				0.5,
				monster,
			),
		).toBe(false);
		expect(
			doesMovingSphereHitVerticalCylinder(
				{ x: -2, y: 1, z: 0 },
				{ x: 2, y: 1, z: 0 },
				0.5,
				monster,
			),
		).toBe(true);
	});

	test('tests spherical body parts as real spheres', () => {
		const sphere = { x: 0, y: 3, z: 0, radius: 0.5 };
		expect(
			doesMovingSphereHitSphere(
				{ x: -2, y: 3, z: 0 },
				{ x: 2, y: 3, z: 0 },
				0.2,
				sphere,
			),
		).toBe(true);
		expect(
			doesMovingSphereHitSphere(
				{ x: -2, y: 4, z: 0 },
				{ x: 2, y: 4, z: 0 },
				0.2,
				sphere,
			),
		).toBe(false);
		expect(
			doesHalfCylinderHitSphere(
				{
					x: 0,
					y: 1,
					z: 0,
					radius: 5,
					height: 2,
					rotationY: 0,
					halfAngle: Math.PI / 2,
				},
				{ x: 0, y: 2.4, z: 2, radius: 0.5 },
			),
		).toBe(true);
	});

	test('an arrow uses a swept box', () => {
		expect(
			doesSweptBoxHitVerticalCylinder(
				{ x: -3, y: 1, z: 0 },
				{ x: 3, y: 1, z: 0 },
				0.2,
				0.2,
				1.2,
				1,
				0,
				monster,
			),
		).toBe(true);
	});

	test('the sword half-cylinder only hits in front', () => {
		const sector = {
			x: 0,
			y: 1,
			z: 0,
			radius: 4,
			height: 2,
			rotationY: 0,
			halfAngle: Math.PI / 2,
		};
		expect(
			doesHalfCylinderHitVerticalCylinder(sector, { ...monster, z: 3 }),
		).toBe(true);
		expect(
			doesHalfCylinderHitVerticalCylinder(sector, { ...monster, z: -3 }),
		).toBe(false);
	});

	test('keeps an offset monster cylinder attached while it turns', () => {
		const source = {
			x: 10,
			y: 2,
			z: 20,
			kind: 'unknown',
			isBoss: false,
			rotationY: 0,
			hitboxRadius: 2,
			hitboxHeight: 4,
			hitboxOffsetX: 1,
			hitboxOffsetY: 2,
			hitboxOffsetZ: 0,
		};
		expect(monsterHitboxCylinder(source)).toMatchObject({
			x: 11,
			y: 4,
			z: 20,
		});
		const turned = monsterHitboxCylinder({
			...source,
			rotationY: Math.PI / 2,
		});
		expect(turned.x).toBeCloseTo(10);
		expect(turned.y).toBe(4);
		expect(turned.z).toBeCloseTo(19);
	});
});

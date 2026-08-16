import { Decoder, Encoder } from '@colyseus/schema';
import { describe, expect, test } from 'vitest';
import {
	CombatEntity,
	GameState,
	Monster,
	Player,
	WeaponState,
} from './GameState';

describe('GameState serialization', () => {
	test('recreates persistent combat state for a late joiner', () => {
		const server = new GameState();
		server.combatTimeS = 12.5;
		const player = new Player();
		player.x = 4;
		const bow = new WeaponState();
		bow.kind = 'bow';
		bow.level = 3;
		bow.activationSequence = 7;
		player.weapons.set('bow', bow);
		server.players.set('player', player);
		const arrow = new CombatEntity();
		arrow.id = 'player:7';
		arrow.kind = 'arrow';
		arrow.weaponKind = 'bow';
		arrow.ownerSessionId = 'player';
		arrow.x = 9;
		arrow.hitboxShape = 'box';
		arrow.hitboxWidth = 0.25;
		arrow.hitboxHeight = 0.25;
		arrow.hitboxDepth = 1.2;
		arrow.expiresAtS = 14;
		server.combatEntities.set(arrow.id, arrow);
		const monster = new Monster();
		monster.kind = 'kraklet';
		monster.hitboxRadius = 4.176;
		monster.hitboxHeight = 5.536;
		monster.hitboxOffsetX = 0.502;
		monster.hitboxOffsetY = 4.241;
		monster.hitboxOffsetZ = 0.669;
		server.monsters.set('monster', monster);

		const client = new GameState();
		new Decoder(client).decode(new Encoder(server).encodeAll());

		expect(client.combatTimeS).toBe(12.5);
		expect(client.players.get('player')?.x).toBe(4);
		expect(client.players.get('player')?.weapons.get('bow')).toMatchObject({
			kind: 'bow',
			level: 3,
			activationSequence: 7,
		});
		expect(client.combatEntities.get('player:7')).toMatchObject({
			kind: 'arrow',
			weaponKind: 'bow',
			ownerSessionId: 'player',
			x: 9,
			expiresAtS: 14,
			hitboxShape: 'box',
			hitboxWidth: 0.25,
			hitboxHeight: 0.25,
		});
		expect(client.combatEntities.get('player:7')?.hitboxDepth).toBeCloseTo(
			1.2,
		);
		expect(client.monsters.get('monster')?.kind).toBe('kraklet');
		expect(client.monsters.get('monster')?.hitboxRadius).toBeCloseTo(4.176);
		expect(client.monsters.get('monster')?.hitboxHeight).toBeCloseTo(5.536);
		expect(client.monsters.get('monster')?.hitboxOffsetX).toBeCloseTo(
			0.502,
		);
		expect(client.monsters.get('monster')?.hitboxOffsetY).toBeCloseTo(
			4.241,
		);
		expect(client.monsters.get('monster')?.hitboxOffsetZ).toBeCloseTo(
			0.669,
		);
		expect(
			Object.hasOwn(client.combatEntities.get('player:7')!, 'damage'),
		).toBe(false);
	});
});

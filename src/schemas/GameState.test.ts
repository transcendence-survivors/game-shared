import { Decoder, Encoder } from '@colyseus/schema';
import { describe, expect, test } from 'vitest';
import { CombatEntity, GameState, Player, WeaponState } from './GameState';

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
		arrow.expiresAtS = 14;
		server.combatEntities.set(arrow.id, arrow);

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
		});
		expect(
			Object.hasOwn(client.combatEntities.get('player:7')!, 'damage'),
		).toBe(false);
	});
});

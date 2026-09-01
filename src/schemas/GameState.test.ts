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
		server.nextBossKind = 'abyssor';
		server.seed = 123456;
		const player = new Player();
		player.x = 4;
		player.y = 6;
		player.debugImmortal = true;
		player.stats.attackDamage = 250;
		player.stats.moveSpeed = 13;
		player.stats.killAmount = 8;
		const bow = new WeaponState();
		bow.kind = 'bow';
		bow.level = 3;
		bow.damageBonus = 0.2;
		bow.quantityBonus = 1;
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
		monster.animStartedAtS = 9.25;
		monster.y = 9;
		monster.hitboxRadius = 4.176;
		monster.hitboxHeight = 5.536;
		monster.hitboxOffsetX = 0.502;
		monster.hitboxOffsetY = 4.241;
		monster.hitboxOffsetZ = 0.669;
		server.monsters.set('monster', monster);

		const client = new GameState();
		new Decoder(client).decode(new Encoder(server).encodeAll());

		expect(client.combatTimeS).toBe(12.5);
		expect(client.nextBossKind).toBe('abyssor');
		expect(client.players.get('player')?.x).toBe(4);
		expect(client.players.get('player')?.y).toBe(6);
		expect(client.players.get('player')?.stats.moveSpeed).toBe(13);
		expect(client.players.get('player')?.stats.killAmount).toBe(8);
		expect(client.players.get('player')?.stats.attackDamage).toBe(100);
		expect(client.players.get('player')?.debugImmortal).toBe(false);
		expect(client.seed).toBe(0);
		expect(client.players.get('player')?.weapons.get('bow')).toMatchObject({
			kind: 'bow',
			level: 3,
			quantityBonus: 1,
		});
		expect(
			client.players.get('player')?.weapons.get('bow')?.damageBonus,
		).toBeCloseTo(0.2);
		expect(
			client.players.get('player')?.weapons.get('bow')
				?.activationSequence,
		).toBe(0);
		expect(client.combatEntities.get('player:7')).toMatchObject({
			kind: 'arrow',
			weaponKind: 'bow',
			ownerSessionId: 'player',
			x: 9,
			hitboxShape: 'box',
			hitboxWidth: 0.25,
			hitboxHeight: 0.25,
		});
		expect(client.combatEntities.get('player:7')?.hitboxDepth).toBeCloseTo(
			1.2,
		);
		expect(client.monsters.get('monster')?.kind).toBe('kraklet');
		expect(client.monsters.get('monster')?.animStartedAtS).toBe(9.25);
		expect(client.monsters.get('monster')?.y).toBe(0);
		expect(client.combatEntities.get('player:7')?.expiresAtS).toBe(0);
		expect(client.monsters.get('monster')?.hitboxRadius).toBe(
			new Monster().hitboxRadius,
		);
		expect(
			Object.hasOwn(client.combatEntities.get('player:7')!, 'damage'),
		).toBe(false);
	});
});

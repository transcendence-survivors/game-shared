import { MapSchema, Schema, type } from '@colyseus/schema';
import { Life } from './Life';
import { Experience } from './Experience';
import {
	MONSTER_BASE_DAMAGE,
	MONSTER_BASE_LIFE,
	MONSTER_BASE_XP_REWARD,
	PLAYER_MAX_LIFE,
	PLAYER_AURA_RADIUS,
	PLAYER_AURA_DAMAGE,
	PLAYER_AURA_ATTACK_SPEED,
} from '../utils/Constants';
import { type MonsterAnimState } from '../utils/Types';

/**
 * Champ de dégâts de contact autour du joueur. Les trois stats sont
 * synchronisées pour que le serveur applique les dégâts et que le client
 * les reflète (taille + cadence du rendu). Pensé pour évoluer : les upgrades
 * n'ont qu'à modifier ces champs, aucune autre couche n'est à toucher.
 */
export class Aura extends Schema {
	@type('number') radius: number = PLAYER_AURA_RADIUS;
	@type('number') damage: number = PLAYER_AURA_DAMAGE;
	// Attaques par seconde.
	@type('number') attackSpeed: number = PLAYER_AURA_ATTACK_SPEED;
}

export class Player extends Schema {
	@type('number') x: number = 0;
	@type('number') y: number = 0;
	@type('number') z: number = 0;
	@type('number') rotationY: number = 0;
	@type('number') velocityY: number = 0;
	@type('boolean') isGrounded: boolean = true;
	@type('number') lastProcessedSeq: number = 0;
	@type('string') animState: 'idle' | 'moving' = 'idle';
	@type(Life) life = new Life(PLAYER_MAX_LIFE);
	@type(Experience) experience = new Experience();
	@type(Aura) aura = new Aura();
	// Server-side only (non synchronisé) : secondes restantes avant la
	// prochaine pulsation de l'aura, cadencée par `aura.attackSpeed`.
	auraCooldownS = 0;
}

export class Monster extends Schema {
	@type('string') kind: string = '';
	@type('boolean') isBoss: boolean = false;
	@type('number') x: number = 0;
	@type('number') y: number = 0;
	@type('number') z: number = 0;
	@type('number') rotationY: number = 0;
	@type('number') damage: number = MONSTER_BASE_DAMAGE;
	@type('number') xpReward: number = MONSTER_BASE_XP_REWARD;
	@type('string') animState: MonsterAnimState = 'idle';
	@type(Life) life = new Life(MONSTER_BASE_LIFE);
	// Server-side only (not synchronized): share of the 500% stat budget,
	// re-rolled by the MonsterManager at every rotation.
	hpMultiplier = 1;
	damageMultiplier = 1;
	// Server-side only: seconds left before the monster may strike again.
	attackCooldownS = 0;
}

export class GameState extends Schema {
	@type({ map: Player }) players = new MapSchema<Player>();
	@type({ map: Monster }) monsters = new MapSchema<Monster>();
	@type('number') rayX: number = 0;
	@type('number') rayY: number = 0;
	@type('number') rayZ: number = 0;
	@type('number') seed: number = 0;
}

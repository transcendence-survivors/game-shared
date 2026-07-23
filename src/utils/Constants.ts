// Gameplay
export const MAX_DT = 0.1;
export const SPEED = 30;
export const ROTATION_SPEED = 0.05;
export const GRAVITY = 60;
export const JUMP_SPEED = 22;
export const PLAYER_HB_RADIUS = 0.6;
// Marche que le joueur peut enjamber sans passer par une rampe. Doit rester très
// petit devant `World.STEP` (hauteur d'un palier) : sinon on grimpe les falaises
// et les flancs de rampe au lieu d'emprunter la pente.
export const PLAYER_STEP_UP = 0.5;

// Light beam
export const SUN_H = 150;
export const ACCESS_RADIUS = 128;
export const RAY_SPEED = 1;
export const RAY_DIR_X = 0;
export const RAY_DIR_Z = 1;

// Life & experience
export const PLAYER_ATTACK_DAMAGE = 10;
export const PLAYER_MAX_LIFE = 100;

// Player aura — champ de dégâts de contact autour du joueur (style Megabonk).
// Ces valeurs ne sont que les valeurs PAR DÉFAUT : les stats vivent dans le
// schéma `Aura` du joueur et sont donc destinées à évoluer (upgrades, niveau).
export const PLAYER_AURA_RADIUS = 6; // portée en unités monde
export const PLAYER_AURA_DAMAGE = 5; // dégâts infligés par attaque
export const PLAYER_AURA_ATTACK_SPEED = 1; // attaques par seconde
export const XP_BASE_TO_LEVEL = 100;
export const XP_LEVEL_GROWTH = 1.2;

// Monsters
export const MONSTER_KINDS = [
	'skitter',
	'venomweb',
	'grunt',
	'ravager',
	'kraklet',
] as const;
export const BOSS_KINDS = [
	'arakhnos',
	'gorvath',
	'khimaera',
	'abyssor',
] as const;
export const MONSTER_BASE_LIFE = 50;
export const MONSTER_BASE_DAMAGE = 5;
export const MONSTER_BASE_XP_REWARD = 10;

// Difficulty scaling
// Stat multipliers: a shared budget of 500% is split between HP and damage.
export const STAT_BUDGET = 5;
export const MIN_STAT_MULTIPLIER = 0.5;
export const BOSS_STAT_SCALE = 100;
// Linear slope of the difficulty curve: +50% base stats per elapsed minute.
export const DIFFICULTY_GROWTH_PER_MINUTE = 0.5;
export const ACTIVE_MONSTER_KIND_COUNT = 3;
export const MONSTER_ROTATION_INTERVAL_S = 120;
export const MONSTER_BOOST_INTERVAL_S = 5;

// Monster population
export const MONSTER_BASE_POPULATION = 3;
export const MONSTER_POPULATION_PER_MINUTE = 2;
export const MONSTER_MAX_POPULATION = 60;
export const MONSTER_SPAWN_MIN_DIST = 20;
export const MONSTER_SPAWN_MAX_DIST = 60;

// Monster behaviour
export const MONSTER_MOVE_SPEED = 18;
export const MONSTER_ATTACK_RANGE = 3;
export const BOSS_ATTACK_RANGE = 7;
export const MONSTER_ATTACK_COOLDOWN_S = 1.2;

// Server
export const TICK_RATE = 60;
export const FIXED_DT = 1 / TICK_RATE;

// Gameplay
export const MAX_DT = 0.1;
export const SPEED = 30;
export const ROTATION_SPEED = 0.05;
export const GRAVITY = 60;
export const JUMP_SPEED = 22;
export const PLAYER_HB_RADIUS = 0.6;

export const PLAYER_STEP_UP = 0.5;

export const SUN_H = 150;
export const ACCESS_RADIUS = 128;
export const RAY_SPEED = 1;
export const RAY_DIR_X = 0;
export const RAY_DIR_Z = 1;

export const PLAYER_ATTACK_DAMAGE = 10;
export const PLAYER_MAX_LIFE = 100;

export const PLAYER_AURA_RADIUS = 24; // TODO 6
export const PLAYER_AURA_DAMAGE = 100; // TODO 5
export const PLAYER_AURA_ATTACK_SPEED = 1;
export const XP_BASE_TO_LEVEL = 25; // TODO 100
export const XP_LEVEL_GROWTH = 1.2;

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

export const STAT_BUDGET = 5;
export const MIN_STAT_MULTIPLIER = 0.5;
export const BOSS_STAT_SCALE = 100;

export const DIFFICULTY_GROWTH_PER_MINUTE = 0.5;
export const ACTIVE_MONSTER_KIND_COUNT = 3;
export const MONSTER_ROTATION_INTERVAL_S = 120;
export const MONSTER_BOOST_INTERVAL_S = 5;

export const MONSTER_BASE_POPULATION = 3;
export const MONSTER_POPULATION_PER_MINUTE = 2;
export const MONSTER_MAX_POPULATION = 60;
export const MONSTER_SPAWN_MIN_DIST = 20;
export const MONSTER_SPAWN_MAX_DIST = 60;

export const MONSTER_MOVE_SPEED = 14;
export const MONSTER_ATTACK_RANGE = 1;
export const BOSS_ATTACK_RANGE = 3;
export const MONSTER_ATTACK_COOLDOWN_S = 1.2;

export const TICK_RATE = 60;
export const FIXED_DT = 1 / TICK_RATE;

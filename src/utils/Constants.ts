/** One complete rotation in radians. */
export const TAU = Math.PI * 2;

export const MAX_DT = 0.1;
export const SPEED = 30;
export const GRAVITY = 60;
export const JUMP_SPEED = 22;
export const PLAYER_HB_RADIUS = 0.6;

export const PLAYER_STEP_UP = 0.5;

export const ACCESS_RADIUS = 128;
/** Maximum distance allowed for the player's center inside the access zone. */
export const PLAYER_ACCESS_RADIUS = ACCESS_RADIUS - PLAYER_HB_RADIUS;
/** Extra streamed ring kept around the playable circle for terrain chunks. */
const CHUNK_DISPLAY_MARGIN = 4;
/** Outer radius used by client chunk visibility and monster spawning. */
export const CHUNK_DISPLAY_RADIUS = ACCESS_RADIUS + CHUNK_DISPLAY_MARGIN;
export const RAY_SPEED = 1;
export const RAY_DIR_X = 0;
export const RAY_DIR_Z = 1;

export const PLAYER_MAX_LIFE = 100;

export const PLAYER_AURA_RADIUS = 24;
export const PLAYER_AURA_ATTACK_SPEED = 1;
export const WEAPON_KINDS = ['aura', 'sword', 'axe', 'staff', 'bow'] as const;
/** The opening kit must clear the first swarm without waiting for upgrades. */
export const STARTER_WEAPON_KINDS = ['aura', 'axe'] as const;
export const COMBAT_ENTITY_KINDS = [
	'sword-slash',
	'axe',
	'fireball',
	'arrow',
] as const;
export const COMBAT_HITBOX_SHAPES = [
	'sphere',
	'box',
	'cylinder',
	'half-cylinder',
] as const;
export const XP_BASE_TO_LEVEL = 25;
export const XP_LEVEL_GROWTH = 1.2;
export const UPGRADE_CHOICE_COUNT = 3;
export const UPGRADE_RARITIES = [
	'common',
	'uncommon',
	'rare',
	'epic',
	'legendary',
] as const;

export const MONSTER_KINDS = [
	'grunt',
	'skitter',
	'kraklet',
	'ravager',
	'venomweb',
	'bomber',
	'splitter',
	'necromancer',
	'wisp',
	'brute',
] as const;
export const BOSS_KINDS = [
	'arakhnos',
	'gorvath',
	'khimaera',
	'abyssor',
] as const;
export const MONSTER_BASE_LIFE = 38;
export const MONSTER_BASE_DAMAGE = 4;
export const MONSTER_BASE_XP_REWARD = 6;

export const MONSTER_BASE_POPULATION = 18;
export const MONSTER_MAX_POPULATION = 1440;
/** Capacity reserved exclusively for boss entities. */
export const MONSTER_BOSS_SLOT_CAPACITY = 5;
/** Initial snapshot capacity for the maximum synchronized monster roster. */
export const STATE_ENCODER_BUFFER_SIZE = 256 * 1024;
export const MONSTER_MOVE_SPEED = 7;
export const MONSTER_ATTACK_RANGE = 1;
export const MONSTER_ATTACK_COOLDOWN_S = 1.4;

export type {
	Vec3d,
	Vec2d,
	ChunkCoordinates,
	ProjectileDirection,
	MoveInput,
	MonsterDamageEvent,
	CombatImpactEvent,
	MovementState,
	MovementBoundary,
	MonsterKind,
	MonsterAnimState,
	BossKind,
	MonsterRank,
	MonsterRole,
	MonsterAiKind,
	MonsterRuntimeStats,
	WeaponKind,
	CombatEntityKind,
	CombatHitboxShape,
	SelectUpgradeInput,
	WorldSeedMessage,
	UpgradeOption,
	UpgradeIcon,
	UpgradeRarity,
	UpgradeCategory,
} from './utils/Types';

export { nextPowerOfTwoCapacity } from './utils/Capacity';

export {
	clampPositionToCircle,
	resolveTerrainCollision,
} from './gameplay/Collisions';

export { findSpawnPoint } from './gameplay/Spawn';

export {
	Player,
	Monster,
	GameState,
	Aura,
	WeaponState,
	CombatEntity,
} from './schemas/GameState';

export {
	ClientMessage,
	ServerMessage,
	MOVE_INPUT_BOOLEAN_FIELDS,
	GAME_ROOM_TYPE,
	normalizeRoomName,
} from './protocol';

export { Life } from './schemas/Life';

export { Experience, xpRequiredForLevel } from './schemas/Experience';

export {
	rollUpgradeOptions,
	rollUpgradeRarity,
	canApplyUpgrade,
	applyUpgrade,
} from './gameplay/RollUpgrades';

export {
	TOME_DEFINITIONS,
	TOME_SLOT_LIMIT,
	TOME_MAX_LEVEL,
	RARITY_CONFIG,
	WEAPON_TRAIT_POOLS,
	WEAPON_ICONS,
	WEAPON_NAMES,
	toUpgradeOption,
	type UpgradeDef,
	type TomeStat,
	type WeaponUpgradeStat,
	type WeaponUpgradeBonus,
} from './utils/Upgrades';

export {
	TAU,
	MAX_DT,
	SPEED,
	GRAVITY,
	JUMP_SPEED,
	ACCESS_RADIUS,
	PLAYER_ACCESS_RADIUS,
	CHUNK_DISPLAY_RADIUS,
	RAY_SPEED,
	RAY_DIR_X,
	RAY_DIR_Z,
	PLAYER_HB_RADIUS,
	PLAYER_STEP_UP,
	PLAYER_MAX_LIFE,
	PLAYER_AURA_RADIUS,
	PLAYER_AURA_ATTACK_SPEED,
	WEAPON_KINDS,
	STARTER_WEAPON_KINDS,
	COMBAT_ENTITY_KINDS,
	COMBAT_HITBOX_SHAPES,
	XP_BASE_TO_LEVEL,
	XP_LEVEL_GROWTH,
	UPGRADE_CHOICE_COUNT,
	UPGRADE_RARITIES,
	MONSTER_KINDS,
	BOSS_KINDS,
	MONSTER_BASE_LIFE,
	MONSTER_BASE_DAMAGE,
	MONSTER_BASE_XP_REWARD,
	MONSTER_BASE_POPULATION,
	MONSTER_MAX_POPULATION,
	MONSTER_BOSS_SLOT_CAPACITY,
	STATE_ENCODER_BUFFER_SIZE,
	MONSTER_MOVE_SPEED,
	MONSTER_ATTACK_RANGE,
	MONSTER_ATTACK_COOLDOWN_S,
} from './utils/Constants';

export {
	World,
	clamp01,
	TERRAIN_SUBDIVISIONS_PER_CELL,
	type WorldColor,
	type WorldNormal,
	type WorldSurfaceSample,
} from './world/World';

export {
	createMoveInput,
	createMovementState,
	simulatePlayerMovement,
	getCameraYaw,
} from './gameplay/Movements';

export {
	MONSTER_DIRECTOR_CONFIG,
	difficultyStageAt,
	computeArchetypeStats,
	targetPopulation,
	bossTimeAt,
} from './gameplay/Difficulty';

export {
	MONSTER_DEFINITIONS,
	getMonsterDefinition,
	isBossKind,
	normalMonsterDefinitions,
	type MonsterDefinition,
} from './gameplay/MonsterCatalog';

export { chaseStep, type ChaseStep } from './gameplay/MonsterAi';

export {
	DEFAULT_MONSTER_HITBOX_RADIUS,
	DEFAULT_MONSTER_HITBOX_HEIGHT,
	DEFAULT_MONSTER_HITBOX_OFFSET_X,
	DEFAULT_MONSTER_HITBOX_OFFSET_Y,
	DEFAULT_MONSTER_HITBOX_OFFSET_Z,
	MONSTER_MODEL_SCALE,
	BOSS_MODEL_SCALE,
	ELITE_MODEL_SCALE,
	MONSTER_HITBOX_PROFILES,
	getMonsterHitbox,
	getMonsterCompoundHitboxes,
	type MonsterHitboxPrimitive,
} from './gameplay/MonsterHitboxes';

export {
	distanceSquared,
	normalizeAngle,
	forwardVector,
	isCircleInSector,
} from './gameplay/CombatGeometry';

export {
	doVerticalCylindersIntersect,
	doesSphereHitVerticalCylinder,
	doesVerticalCylinderHitMonsterPart,
	doesMovingSphereHitVerticalCylinder,
	doesMovingSphereHitSphere,
	doesSweptBoxHitVerticalCylinder,
	doesSweptBoxHitSphere,
	doesHalfCylinderHitVerticalCylinder,
	doesHalfCylinderHitSphere,
	doesHalfCylinderHitMonsterPart,
	monsterHitboxPrimitives,
	type VerticalCylinder,
	type MonsterCylinderSource,
	type MonsterWorldHitbox,
} from './gameplay/CombatGeometry3d';

export type {
	AuraWeaponConfig,
	SwordWeaponConfig,
	AxeWeaponConfig,
	StaffWeaponConfig,
	BowWeaponConfig,
	WeaponConfig,
	CombatLimits,
} from './combat/WeaponConfig';

export {
	COMBAT_CONFIG_VERSION,
	COMBAT_LIMITS,
	WEAPON_CONFIGS,
} from './combat/WeaponConfigs';

export {
	WeaponConfigRegistry,
	weaponConfigRegistry,
} from './combat/WeaponConfigRegistry';

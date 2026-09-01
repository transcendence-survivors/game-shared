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
	MonsterAnimState,
	BossKind,
	MonsterRank,
	MonsterRuntimeStats,
	WeaponKind,
	CombatEntityKind,
	CombatHitboxShape,
	SelectUpgradeInput,
	WorldSeedMessage,
	GameRoomOptions,
	UpgradeOption,
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
	WeaponState,
	CombatEntity,
} from './schemas/GameState';

export {
	ClientMessage,
	ServerMessage,
	MOVE_INPUT_BOOLEAN_FIELDS,
	GAME_ROOM_TYPE,
	GAME_ROOM_NAME_PROPERTY,
	normalizeRoomName,
} from './protocol';

export { Life } from './schemas/Life';

export { Experience } from './schemas/Experience';

export { rollUpgradeOptions, applyUpgrade } from './gameplay/RollUpgrades';

export {
	RARITY_CONFIG,
	WEAPON_ICONS,
	WEAPON_NAMES,
	toUpgradeOption,
	type UpgradeDef,
} from './utils/Upgrades';

export {
	TAU,
	MAX_DT,
	ACCESS_RADIUS,
	PLAYER_ACCESS_RADIUS,
	CHUNK_DISPLAY_RADIUS,
	RAY_SPEED,
	RAY_DIR_X,
	RAY_DIR_Z,
	PLAYER_HB_RADIUS,
	WEAPON_KINDS,
	STARTER_WEAPON_KINDS,
	UPGRADE_CHOICE_COUNT,
	MONSTER_KINDS,
	BOSS_KINDS,
	MONSTER_MAX_POPULATION,
	STATE_ENCODER_BUFFER_SIZE,
} from './utils/Constants';

export {
	World,
	clamp01,
	lerp,
	TERRAIN_SUBDIVISIONS_PER_CELL,
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

export { chaseStep } from './gameplay/MonsterAi';

export {
	DEFAULT_MONSTER_HITBOX_RADIUS,
	MONSTER_MODEL_SCALE,
	BOSS_MODEL_SCALE,
	ELITE_MODEL_SCALE,
	getMonsterHitbox,
	getMonsterCompoundHitboxes,
	type MonsterHitboxPrimitive,
} from './gameplay/MonsterHitboxes';

export {
	distanceSquared,
	normalizeAngle,
	forwardVector,
} from './gameplay/CombatGeometry';

export {
	doesSphereHitVerticalCylinder,
	doesVerticalCylinderHitMonsterPart,
	doesMovingSphereHitVerticalCylinder,
	doesMovingSphereHitSphere,
	doesSweptBoxHitVerticalCylinder,
	doesSweptBoxHitSphere,
	doesHalfCylinderHitMonsterPart,
	monsterHitboxPrimitives,
	type MonsterWorldHitbox,
} from './gameplay/CombatGeometry3d';

export type {
	AuraWeaponConfig,
	SwordWeaponConfig,
	AxeWeaponConfig,
	StaffWeaponConfig,
	BowWeaponConfig,
	WeaponConfig,
} from './combat/WeaponConfig';

export { COMBAT_LIMITS } from './combat/WeaponConfigs';

export {
	WeaponConfigRegistry,
	weaponConfigRegistry,
} from './combat/WeaponConfigRegistry';

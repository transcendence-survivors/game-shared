export type {
	Vec3d,
	Vec2d,
	MoveInput,
	AttackInput,
	MonsterDamageEvent,
	CombatImpactEvent,
	MovementState,
	VerticalMove,
	HorizontalMove,
	MonsterKind,
	MonsterAnimState,
	BossKind,
	StatMultipliers,
	MonsterStats,
	WeaponKind,
	CombatEntityKind,
	CombatEntityPhase,
	SelectUpgradeInput,
	WorldSeedMessage,
	GameOverMessage,
	UpgradeOption,
} from './utils/Types';

export { resolveTerrainCollision } from './gameplay/Collisions';

export { findSpawnPoint, type SpawnPoint } from './gameplay/Spawn';

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
	type ClientMessageName,
	type ServerMessageName,
} from './protocol';

export { Life } from './schemas/Life';

export { Experience, xpRequiredForLevel } from './schemas/Experience';

export { rollUpgradeOptions } from './gameplay/RollUpgrades';

export {
	MAX_DT,
	SPEED,
	ROTATION_SPEED,
	GRAVITY,
	JUMP_SPEED,
	SUN_H,
	ACCESS_RADIUS,
	RAY_SPEED,
	RAY_DIR_X,
	RAY_DIR_Z,
	TICK_RATE,
	FIXED_DT,
	PLAYER_HB_RADIUS,
	PLAYER_STEP_UP,
	PLAYER_ATTACK_DAMAGE,
	PLAYER_MAX_LIFE,
	PLAYER_AURA_RADIUS,
	PLAYER_AURA_DAMAGE,
	PLAYER_AURA_ATTACK_SPEED,
	WEAPON_KINDS,
	COMBAT_ENTITY_KINDS,
	COMBAT_ENTITY_PHASES,
	XP_BASE_TO_LEVEL,
	XP_LEVEL_GROWTH,
	MONSTER_KINDS,
	BOSS_KINDS,
	MONSTER_BASE_LIFE,
	MONSTER_BASE_DAMAGE,
	MONSTER_BASE_XP_REWARD,
	STAT_BUDGET,
	MIN_STAT_MULTIPLIER,
	BOSS_STAT_SCALE,
	DIFFICULTY_GROWTH_PER_MINUTE,
	ACTIVE_MONSTER_KIND_COUNT,
	MONSTER_ROTATION_INTERVAL_S,
	MONSTER_BOOST_INTERVAL_S,
	MONSTER_BASE_POPULATION,
	MONSTER_POPULATION_PER_MINUTE,
	MONSTER_MAX_POPULATION,
	MONSTER_SPAWN_MIN_DIST,
	MONSTER_SPAWN_MAX_DIST,
	MONSTER_MOVE_SPEED,
	MONSTER_ATTACK_RANGE,
	BOSS_ATTACK_RANGE,
	MONSTER_ATTACK_COOLDOWN_S,
} from './utils/Constants';

export { World } from './world/World';

export {
	applyVerticalMovement,
	applyHorizontalMovement,
	getCameraYaw,
	clampToRadius,
	isInsideRay,
} from './gameplay/Movements';

export {
	difficultyFactor,
	splitStatBudget,
	computeMonsterStats,
	targetPopulation,
	pickDistinct,
} from './gameplay/Difficulty';

export { nearestIndex, chaseStep, type ChaseStep } from './gameplay/MonsterAi';

export {
	distanceSquared,
	normalizeAngle,
	rotateVector,
	forwardVector,
	isPointInCircle,
	isCircleInSector,
	distanceSquaredToSegment,
	doesMovingCircleHitCircle,
} from './gameplay/CombatGeometry';

export type {
	WeaponLevelScaling,
	BaseWeaponConfig,
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
	DEFAULT_WEAPON_LEVEL_SCALING,
	COMBAT_LIMITS,
	WEAPON_CONFIGS,
} from './combat/WeaponConfigs';

export {
	WeaponConfigRegistry,
	weaponConfigRegistry,
} from './combat/WeaponConfigRegistry';

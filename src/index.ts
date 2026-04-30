export { Vec3 } from './math/Vec3';
export type { IVec3 } from './math/Vec3';

export { TerrainGenerator } from './world/TerrainGenerator';

export { HealthSystem } from './systems/HealthSystem';
export type { HealthChangeListener, DeathListener } from './systems/HealthSystem';

export { HitDetector } from './combat/HitDetector';
export type { HitDetectorConfig } from './combat/HitDetector';
export { SwingAnimation } from './combat/SwingAnimation';
export type { SwingAnimationConfig } from './combat/SwingAnimation';

export { DifficultyCurve } from './difficulty/DifficultyCurve';
export type { DifficultyCurveConfig, UnlockEntry } from './difficulty/DifficultyCurve';
export { MonsterCatalog } from './difficulty/MonsterCatalog';
export type { MonsterType, ColorRgb } from './difficulty/MonsterType';

export { MonsterAI } from './entities/MonsterAI';
export type { MonsterAIConfig } from './entities/MonsterAI';

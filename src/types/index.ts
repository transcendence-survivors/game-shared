/**
 * @file Barrel re-export for all shared type declarations.
 *
 * Consumers should prefer `import type { X } from '@transcendence/game-shared'`
 * over deep paths so internal reorganisation stays a non-breaking change.
 */

export type { InputCommand } from './messages';
export type { PlayerStateView } from './state';

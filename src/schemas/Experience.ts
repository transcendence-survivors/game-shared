import { Schema, type } from '@colyseus/schema';
import { XP_BASE_TO_LEVEL, XP_LEVEL_GROWTH } from '../utils/Constants';

export function xpRequiredForLevel(level: number): number {
	return Math.round(XP_BASE_TO_LEVEL * Math.pow(XP_LEVEL_GROWTH, level - 1));
}

export class Experience extends Schema {
	@type('number') level: number = 1;
	@type('number') xp: number = 0;
	@type('number') xpToNextLevel: number = xpRequiredForLevel(1);

	gain(amount: number) {
		if (!Number.isFinite(amount) || amount <= 0) return;
		this.xp += amount;
		while (this.xp >= this.xpToNextLevel) {
			this.xp -= this.xpToNextLevel;
			this.level += 1;
			this.xpToNextLevel = xpRequiredForLevel(this.level);
		}
	}

	ratio(): number {
		return this.xp / this.xpToNextLevel;
	}
}

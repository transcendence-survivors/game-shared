import { Schema, type } from '@colyseus/schema';

export class Life extends Schema {
	@type('number') max: number;
	@type('number') current: number;

	constructor(max: number = 1) {
		super();
		if (!Number.isFinite(max) || max <= 0) {
			throw new RangeError(
				`Life max must be a positive number, got ${max}`,
			);
		}
		this.max = max;
		this.current = max;
	}

	takeDamage(amount: number) {
		if (!Number.isFinite(amount) || amount <= 0) return;
		this.current = Math.max(0, this.current - amount);
	}

	heal(amount: number) {
		if (!Number.isFinite(amount) || amount <= 0) return;
		this.current = Math.min(this.max, this.current + amount);
	}

	refill() {
		this.current = this.max;
	}

	rescale(newMax: number) {
		if (!Number.isFinite(newMax) || newMax <= 0) return;
		const ratio = this.ratio();
		this.max = newMax;
		this.current = newMax * ratio;
	}

	isDepleted(): boolean {
		return this.current <= 0;
	}

	ratio(): number {
		return this.current / this.max;
	}
}

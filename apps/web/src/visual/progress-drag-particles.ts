export interface ProgressDragParticleEmitter {
	emit(x: number, y: number): void;
	dispose(): void;
}

export interface ProgressDragParticleEmitterOptions {
	documentRef?: Document;
	performanceRef?: Pick<Performance, "now">;
	random?: () => number;
	setTimeoutRef?: typeof window.setTimeout;
	clearTimeoutRef?: typeof window.clearTimeout;
}

export function createProgressDragParticleEmitter(opts: ProgressDragParticleEmitterOptions = {}): ProgressDragParticleEmitter {
	const documentRef = opts.documentRef ?? (typeof document !== "undefined" ? document : undefined);
	const performanceRef = opts.performanceRef ?? (typeof performance !== "undefined" ? performance : undefined);
	const random = opts.random ?? Math.random;
	const setTimeoutRef = opts.setTimeoutRef ?? (typeof window !== "undefined" ? window.setTimeout.bind(window) : undefined);
	const clearTimeoutRef = opts.clearTimeoutRef ?? (typeof window !== "undefined" ? window.clearTimeout.bind(window) : undefined);
	const particles = new Set<HTMLElement>();
	const timeouts = new Set<number>();
	let lastParticleAt = -Infinity;

	return {
		emit(x, y) {
			if (!documentRef || !performanceRef || !setTimeoutRef) return;
			const now = performanceRef.now();
			if (now - lastParticleAt < 46) return;
			lastParticleAt = now;
			for (let i = 0; i < 3; i += 1) {
				const dot = documentRef.createElement("span");
				dot.className = "progress-drag-particle";
				const dx = (random() - 0.5) * 34;
				const dy = -10 - random() * 28;
				dot.style.setProperty("--px", `${x}px`);
				dot.style.setProperty("--py", `${y}px`);
				dot.style.setProperty("--dx", `${dx}px`);
				dot.style.setProperty("--dy", `${dy}px`);
				documentRef.body.appendChild(dot);
				particles.add(dot);
				const timeout = setTimeoutRef(() => {
					dot.remove();
					particles.delete(dot);
					timeouts.delete(timeout);
				}, 700);
				timeouts.add(timeout);
			}
		},
		dispose() {
			if (clearTimeoutRef) {
				for (const timeout of timeouts) clearTimeoutRef(timeout);
			}
			timeouts.clear();
			for (const particle of particles) particle.remove();
			particles.clear();
		},
	};
}

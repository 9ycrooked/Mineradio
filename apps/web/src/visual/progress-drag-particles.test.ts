import { expect, test } from "bun:test";
import { createProgressDragParticleEmitter } from "./progress-drag-particles";

test("progress drag emitter mirrors baseline particle count, CSS variables, throttle, and cleanup", async () => {
	await import("../../../../packages/visual-engine/src/runtime/happy-dom-preload");
	document.body.innerHTML = "";
	let now = 100;
	const callbacks: Array<() => void> = [];
	const cleared: number[] = [];
	const emitter = createProgressDragParticleEmitter({
		documentRef: document,
		performanceRef: { now: () => now },
		random: () => 0.5,
		setTimeoutRef: ((callback: () => void) => {
			callbacks.push(callback);
			return callbacks.length;
		}) as typeof window.setTimeout,
		clearTimeoutRef: ((id: number) => {
			cleared.push(id);
		}) as typeof window.clearTimeout,
	});

	emitter.emit(140, 42.5);
	let particles = [...document.body.querySelectorAll(".progress-drag-particle")] as HTMLElement[];
	expect(particles.length).toBe(3);
	expect(particles[0].style.getPropertyValue("--px")).toBe("140px");
	expect(particles[0].style.getPropertyValue("--py")).toBe("42.5px");
	expect(particles[0].style.getPropertyValue("--dx")).toBe("0px");
	expect(particles[0].style.getPropertyValue("--dy")).toBe("-24px");

	now += 45;
	emitter.emit(160, 42.5);
	particles = [...document.body.querySelectorAll(".progress-drag-particle")] as HTMLElement[];
	expect(particles.length).toBe(3);

	now += 1;
	emitter.emit(160, 42.5);
	particles = [...document.body.querySelectorAll(".progress-drag-particle")] as HTMLElement[];
	expect(particles.length).toBe(6);

	for (const callback of callbacks) callback();
	particles = [...document.body.querySelectorAll(".progress-drag-particle")] as HTMLElement[];
	expect(particles.length).toBe(0);

	now += 46;
	emitter.emit(180, 42.5);
	expect(document.body.querySelectorAll(".progress-drag-particle").length).toBe(3);
	emitter.dispose();
	expect(document.body.querySelectorAll(".progress-drag-particle").length).toBe(0);
	expect(cleared).toEqual([7, 8, 9]);
});

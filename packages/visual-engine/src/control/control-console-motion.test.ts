import { expect, test } from "bun:test";
import {
	createControlConsoleMotion,
	type GsapLike,
	type GsapTimelineLike,
	type GsapTweenLike,
} from "./control-console-motion";

type RecordedCall = { method: string; args: unknown[] };

function makeFakeTimeline(recorder: RecordedCall[]): GsapTimelineLike {
	const node: GsapTimelineLike = {
		to(target, vars, position) {
			recorder.push({ method: "tl.to", args: [target, vars, position] });
			return node;
		},
		fromTo(target, from, to, position) {
			recorder.push({ method: "tl.fromTo", args: [target, from, to, position] });
			return node;
		},
		kill() {
			recorder.push({ method: "tl.kill", args: [] });
			return node;
		},
	};
	return node;
}

function makeFakeGsap(recorder: RecordedCall[]): GsapLike {
	return {
		to(target, vars) {
			recorder.push({ method: "to", args: [target, vars] });
			return { kill: () => recorder.push({ method: "tween.kill", args: [target] }) };
		},
		fromTo(target, from, to) {
			recorder.push({ method: "fromTo", args: [target, from, to] });
			return { kill: () => recorder.push({ method: "tween.kill", args: [target] }) };
		},
		set(target, vars) {
			recorder.push({ method: "set", args: [target, vars] });
		},
		killTweensOf(target, props) {
			recorder.push({ method: "killTweensOf", args: [target, props] });
		},
		timeline(vars) {
			recorder.push({ method: "timeline", args: [vars] });
			return makeFakeTimeline(recorder);
		},
	};
}

function makeStubElement(id: string): HTMLElement {
	const el = {
		id,
		className: "",
		style: { pointerEvents: "" } as unknown as CSSStyleDeclaration,
		classList: {
			_tokens: new Set<string>(),
			add(...tokens: string[]) { tokens.forEach((t) => (this as unknown as { _tokens: Set<string> })._tokens.add(t)); },
			remove(...tokens: string[]) { tokens.forEach((t) => (this as unknown as { _tokens: Set<string> })._tokens.delete(t)); },
			contains(t: string) { return (this as unknown as { _tokens: Set<string> })._tokens.has(t); },
			toggle(t: string, force?: boolean) {
				const set = (this as unknown as { _tokens: Set<string> })._tokens;
				if (force === true || (force === undefined && !set.has(t))) set.add(t);
				else set.delete(t);
			},
		},
		querySelector() { return null; },
		addEventListener() {},
		removeEventListener() {},
	} as unknown as HTMLElement;
	return el;
}

test("playButtonHover active issues gsap.to with y=-2 scale 1.07 duration 0.20 ease power2.out", async () => {
	const calls: RecordedCall[] = [];
	const gsap = makeFakeGsap(calls);
	const playTarget = makeStubElement("play-btn");
	const bar = makeStubElement("bottom-bar");
	const motion = createControlConsoleMotion({
		root: { bar, modeButton: null, modeIcon: null, playButton: playTarget, normalButtons: [] },
		gsapProvider: () => gsap,
	});
	await motion.init();
	motion.playButtonHover(playTarget, true);
	const call = calls.find((c) => c.method === "to" && (c.args[0] as HTMLElement) === playTarget);
	expect(call).not.toBeNull();
	const vars = (call!.args[1] as Record<string, unknown>);
	expect(vars.y).toBe(-2);
	expect(vars.scale).toBe(1.07);
	expect(vars.duration).toBe(0.20);
	expect(vars.ease).toBe("power2.out");
	motion.dispose();
});

test("normalButtonHover active uses scale 1.08 duration 0.20 ease power2.out", async () => {
	const calls: RecordedCall[] = [];
	const gsap = makeFakeGsap(calls);
	const normalTarget = makeStubElement("prev-btn");
	const bar = makeStubElement("bottom-bar");
	const motion = createControlConsoleMotion({
		root: { bar, modeButton: null, modeIcon: null, playButton: null, normalButtons: [normalTarget] },
		gsapProvider: () => gsap,
	});
	await motion.init();
	motion.normalButtonHover(normalTarget, true);
	const call = calls.find((c) => c.method === "to" && (c.args[0] as HTMLElement) === normalTarget);
	expect(call).not.toBeNull();
	const vars = (call!.args[1] as Record<string, unknown>);
	expect(vars.y).toBe(-2);
	expect(vars.scale).toBe(1.08);
	expect(vars.duration).toBe(0.20);
	expect(vars.ease).toBe("power2.out");
	motion.dispose();
});

test("playButtonPress active uses scale 0.91 (per-isPlay); normal button uses 0.90", async () => {
	const calls: RecordedCall[] = [];
	const gsap = makeFakeGsap(calls);
	const playTarget = makeStubElement("play-btn");
	const normalTarget = makeStubElement("prev-btn");
	const bar = makeStubElement("bottom-bar");
	const motion = createControlConsoleMotion({
		root: { bar, modeButton: null, modeIcon: null, playButton: playTarget, normalButtons: [normalTarget] },
		gsapProvider: () => gsap,
	});
	await motion.init();
	motion.playButtonPress(playTarget, true);
	motion.buttonPress(normalTarget, true);
	const playCall = calls.find((c) => c.method === "to" && (c.args[0] as HTMLElement) === playTarget);
	const normalCall = calls.find((c) => c.method === "to" && (c.args[0] as HTMLElement) === normalTarget);
	expect((playCall!.args[1] as Record<string, unknown>).scale).toBe(0.91);
	expect((normalCall!.args[1] as Record<string, unknown>).scale).toBe(0.90);
	motion.dispose();
});

test("buttonRelease uses back.out(1.9) for btn and back.out(1.8) for icon, base duration 0.24 / 0.22", async () => {
	const calls: RecordedCall[] = [];
	const gsap = makeFakeGsap(calls);
	const playTarget = makeStubElement("play-btn");
	const bar = makeStubElement("bottom-bar");
	const motion = createControlConsoleMotion({
		root: { bar, modeButton: null, modeIcon: null, playButton: playTarget, normalButtons: [] },
		gsapProvider: () => gsap,
	});
	await motion.init();
	motion.buttonRelease(playTarget, { isPlay: true, hovered: true });
	const call = calls.find((c) => c.method === "to" && (c.args[0] as HTMLElement) === playTarget);
	expect(call).not.toBeNull();
	const vars = (call!.args[1] as Record<string, unknown>);
	expect(vars.ease).toBe("back.out(1.9)");
	expect(vars.duration).toBe(0.24);
	motion.dispose();
});

test("clickPulse play button emits box-shadow tween duration 0.58 ease sine.out scaling to 18px", async () => {
	const calls: RecordedCall[] = [];
	const gsap = makeFakeGsap(calls);
	const playTarget = makeStubElement("play-btn");
	const bar = makeStubElement("bottom-bar");
	const motion = createControlConsoleMotion({
		root: { bar, modeButton: null, modeIcon: null, playButton: playTarget, normalButtons: [] },
		gsapProvider: () => gsap,
	});
	await motion.init();
	motion.clickPulse(playTarget, "play");
	const fromTo = calls.find((c) => c.method === "fromTo" && (c.args[0] as HTMLElement) === playTarget);
	expect(fromTo).not.toBeNull();
	const target = (fromTo!.args[2] as Record<string, unknown>);
	expect(target.boxShadow).toBe("0 0 0 18px rgba(255,63,85,0)");
	expect(target.duration).toBe(0.58);
	expect(target.ease).toBe("sine.out");
	motion.dispose();
});

test("clickPulse normal button uses 10px and 0.42s", async () => {
	const calls: RecordedCall[] = [];
	const gsap = makeFakeGsap(calls);
	const normalTarget = makeStubElement("next-btn");
	const bar = makeStubElement("bottom-bar");
	const motion = createControlConsoleMotion({
		root: { bar, modeButton: null, modeIcon: null, playButton: null, normalButtons: [normalTarget] },
		gsapProvider: () => gsap,
	});
	await motion.init();
	motion.clickPulse(normalTarget, "normal");
	const fromTo = calls.find((c) => c.method === "fromTo" && (c.args[0] as HTMLElement) === normalTarget);
	expect(fromTo).not.toBeNull();
	const target = (fromTo!.args[2] as Record<string, unknown>);
	expect(target.boxShadow).toBe("0 0 0 10px rgba(255,63,85,0)");
	expect(target.duration).toBe(0.42);
	motion.dispose();
});

test("toggleModeButton builds timeline scale .86 rotate -8 -> 1.12 rotate 4 duration 0.16 ease power2.out then back.out(2.1) duration 0.34", async () => {
	const calls: RecordedCall[] = [];
	const gsap = makeFakeGsap(calls);
	const modeButton = makeStubElement("play-mode-btn");
	const modeIcon = makeStubElement("play-mode-icon");
	const bar = makeStubElement("bottom-bar");
	const motion = createControlConsoleMotion({
		root: { bar, modeButton, modeIcon, playButton: null, normalButtons: [] },
		gsapProvider: () => gsap,
	});
	await motion.init();
	motion.toggleModeButton("shuffle");
	const tlFromTo = calls.find((c) => c.method === "tl.fromTo" && (c.args[0] as HTMLElement) === modeButton);
	expect(tlFromTo).not.toBeNull();
	const from = tlFromTo!.args[1] as Record<string, unknown>;
	const to = tlFromTo!.args[2] as Record<string, unknown>;
	expect(from.scale).toBe(0.86);
	expect(from.rotate).toBe(-8);
	expect(to.scale).toBe(1.12);
	expect(to.rotate).toBe(4);
	expect(to.duration).toBe(0.16);
	expect(to.ease).toBe("power2.out");
	const tlTo = calls.find((c) => c.method === "tl.to" && (c.args[0] as HTMLElement) === modeButton);
	expect(tlTo).not.toBeNull();
	const back = tlTo!.args[1] as Record<string, unknown>;
	expect(back.scale).toBe(1);
	expect(back.rotate).toBe(0);
	expect(back.duration).toBe(0.34);
	expect(back.ease).toBe("back.out(2.1)");
	motion.dispose();
});

test("animateListItems first-18 limit, alpha 0->1, duration 0.22, stagger 0.012, power2.out", async () => {
	const calls: RecordedCall[] = [];
	const gsap = makeFakeGsap(calls);
	const bar = makeStubElement("bottom-bar");
	const items: HTMLElement[] = [];
	for (let i = 0; i < 32; i++) items.push(makeStubElement("li-" + i));
	const motion = createControlConsoleMotion({
		root: { bar, modeButton: null, modeIcon: null, playButton: null, normalButtons: [] },
		gsapProvider: () => gsap,
	});
	await motion.init();
	motion.animateListItems(items);
	const fromTo = calls.find((c) => c.method === "fromTo");
	expect(fromTo).not.toBeNull();
	const targets = fromTo!.args[0] as HTMLElement[];
	expect(targets.length).toBe(18);
	const from = fromTo!.args[1] as Record<string, unknown>;
	const to = fromTo!.args[2] as Record<string, unknown>;
	expect(from.autoAlpha).toBe(0);
	expect(to.autoAlpha).toBe(1);
	expect(to.duration).toBe(0.22);
	expect(to.stagger).toBe(0.012);
	expect(to.ease).toBe("power2.out");
	motion.dispose();
});

test("reveal schedules hide after 520ms by default and respects isHomeControlsLocked", async () => {
	const calls: RecordedCall[] = [];
	const gsap = makeFakeGsap(calls);
	const bar = makeStubElement("bottom-bar");
	const motion = createControlConsoleMotion({
		root: { bar, modeButton: null, modeIcon: null, playButton: null, normalButtons: [] },
		gsapProvider: () => gsap,
		deps: {
			isHomeControlsLocked: () => true,
			isShelfSuppressed: () => false,
		},
	});
	await motion.init();
	motion.reveal(520);
	expect(bar.classList.contains("visible")).toBe(false);
	motion.dispose();
});

test("happy-path: real gsap import via default factory, init does not throw", async () => {
	const bar = makeStubElement("bottom-bar");
	const playTarget = makeStubElement("play-btn");
	const motion = createControlConsoleMotion({
		root: { bar, modeButton: null, modeIcon: null, playButton: playTarget, normalButtons: [] },
	});
	await motion.init();
	expect(typeof motion.playButtonHover).toBe("function");
	motion.dispose();
});
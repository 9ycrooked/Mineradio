// NOTE: byte-equal port of the Electron baseline GSAP motion for the bottom-bar console
// and list motion (public/index.html line 5258-5308, 18761-18785, 18937-18987, 19154-19234).
// Test seam: gsap is dependency-injected via gsapProvider. The module lazy-imports real gsap
// when none is provided (matches Electron baseline behaviour using window.gsap).

export interface GsapTweenLike {
	kill(): void;
}

export interface GsapTimelineLike extends GsapTweenLike {
	to(target: unknown, vars: unknown, position?: unknown): GsapTimelineLike;
	fromTo(target: unknown, from: unknown, to: unknown, position?: unknown): GsapTimelineLike;
}

export interface GsapLike {
	to(target: unknown, vars: Record<string, unknown>): GsapTweenLike;
	fromTo(target: unknown, from: Record<string, unknown>, to: Record<string, unknown> & { onComplete?: () => void }): GsapTweenLike;
	set(target: unknown, vars: Record<string, unknown>): void;
	killTweensOf(target: unknown, props?: string | boolean): void;
	timeline(vars?: Record<string, unknown>): GsapTimelineLike;
}

export type GsapProvider = () => GsapLike | Promise<GsapLike>;

export type ButtonKind = "play" | "normal";

export interface ConsoleMotionRoot {
	bar: HTMLElement;
	modeButton: HTMLElement | null;
	modeIcon: HTMLElement | SVGElement | null;
	playButton: HTMLElement | null;
	normalButtons: HTMLElement[];
}

export interface ConsoleMotionDeps {
	controlsHovering?: () => boolean;
	miniQueueOpen?: () => boolean;
	controlsAutoHide?: () => boolean;
	isShelfSuppressed?: () => boolean;
	isHomeControlsLocked?: () => boolean;
}

export interface ControlConsoleMotion {
	init(): Promise<void>;
	reveal(delayMs?: number): void;
	setHidden(hidden: boolean): void;
	playButtonHover(target: HTMLElement, active: boolean): void;
	normalButtonHover(target: HTMLElement, active: boolean): void;
	buttonPress(target: HTMLElement, active: boolean): void;
	playButtonPress(target: HTMLElement, active: boolean): void;
	buttonRelease(target: HTMLElement, opts: { isPlay: boolean; hovered: boolean }): void;
	clickPulse(target: HTMLElement, kind: ButtonKind): void;
	toggleModeButton(currentNext?: string): void;
	animateListItems(items: HTMLElement[], opts?: ListAnimateOptions): void;
	installSmoothWheel(scrollEl: HTMLElement): () => void;
	dispose(): void;
}

export interface ListAnimateOptions {
	limit?: number;
	x?: number;
	y?: number;
	duration?: number;
	stagger?: number;
	ease?: string;
}

const defaultGsapProvider: GsapProvider = async () => {
	const mod = await import("gsap");
	const g = (mod as { gsap?: GsapLike; default?: GsapLike }).gsap ?? (mod as { default?: GsapLike }).default;
	if (!g) throw new Error("gsap factory could not resolve a gsap instance");
	return g;
};

export interface CreateControlConsoleMotionOptions {
	root: ConsoleMotionRoot;
	deps?: ConsoleMotionDeps;
	gsapProvider?: GsapProvider;
}

export function createControlConsoleMotion(opts: CreateControlConsoleMotionOptions): ControlConsoleMotion {
	const { root, deps = {}, gsapProvider = defaultGsapProvider } = opts;
	let gsap: GsapLike | null = null;
	let ready = false;
	let disposed = false;
	const hideTimers: ReturnType<typeof setTimeout>[] = [];
	const unsubscribers: Array<() => void> = [];
	const observedScrollTargets: Set<HTMLElement> = new Set();

	function requireGsap(): GsapLike {
		if (!gsap || disposed) {
			throw new Error("control-console-motion: gsap not ready (call init() first)");
		}
		return gsap;
	}

	function scheduleHide(delayMs: number): void {
		const t = setTimeout(() => {
			if (disposed) return;
			if (!deps.controlsAutoHide || deps.controlsAutoHide()) {
				if (!deps.controlsHovering || !deps.controlsHovering()) {
					setHidden(true);
				}
			}
		}, delayMs);
		hideTimers.push(t);
	}

	function reveal(delayMs: number = 520): void {
		if (disposed) return;
		if (deps.isHomeControlsLocked && deps.isHomeControlsLocked()) return;
		if (deps.isShelfSuppressed && deps.isShelfSuppressed()) return;
		root.bar.classList.add("visible");
		setHidden(false);
		if (deps.controlsAutoHide === undefined || deps.controlsAutoHide()) {
			scheduleHide(delayMs);
		}
	}

	function setHidden(hidden: boolean): void {
		if (disposed) return;
		let effective = hidden;
		if (effective) {
			const hovering = !!(deps.controlsHovering && deps.controlsHovering());
			const miniQueue = !!(deps.miniQueueOpen && deps.miniQueueOpen());
			if (hovering || miniQueue) effective = false;
		}
		const autoHide = deps.controlsAutoHide === undefined ? true : deps.controlsAutoHide();
		root.bar.classList.toggle("soft-hidden", !!effective && autoHide && root.bar.classList.contains("visible"));
		root.bar.style.pointerEvents = "";
	}

	function playButtonHover(target: HTMLElement, active: boolean): void {
		const g = requireGsap();
		const icon = target.querySelector("svg,.lyrics-word-icon,#quality-btn-label") as HTMLElement | null;
		if (active) {
			g.to(target, { y: -2, scale: 1.07, duration: 0.20, ease: "power2.out", overwrite: "auto" });
			if (icon) g.to(icon, { scale: 1.08, duration: 0.22, ease: "power2.out", overwrite: "auto" });
		} else {
			g.to(target, { y: 0, scale: 1, rotate: 0, duration: 0.26, ease: "power2.out", overwrite: "auto" });
			if (icon) g.to(icon, { scale: 1, rotate: 0, duration: 0.22, ease: "power2.out", overwrite: "auto" });
		}
	}

	function normalButtonHover(target: HTMLElement, active: boolean): void {
		const g = requireGsap();
		const icon = target.querySelector("svg,.lyrics-word-icon,#quality-btn-label") as HTMLElement | null;
		if (active) {
			g.to(target, { y: -2, scale: 1.08, duration: 0.20, ease: "power2.out", overwrite: "auto" });
			if (icon) g.to(icon, { scale: 1.10, duration: 0.22, ease: "power2.out", overwrite: "auto" });
		} else {
			g.to(target, { y: 0, scale: 1, rotate: 0, duration: 0.26, ease: "power2.out", overwrite: "auto" });
			if (icon) g.to(icon, { scale: 1, rotate: 0, duration: 0.22, ease: "power2.out", overwrite: "auto" });
		}
	}

	function buttonPress(target: HTMLElement, active: boolean): void {
		const g = requireGsap();
		const icon = target.querySelector("svg,.lyrics-word-icon,#quality-btn-label") as HTMLElement | null;
		if (active) {
			g.to(target, { y: 0, scale: 0.90, duration: 0.10, ease: "power2.out", overwrite: "auto" });
			if (icon) g.to(icon, { scale: 0.88, duration: 0.10, ease: "power2.out", overwrite: "auto" });
		} else {
			g.to(target, { y: 0, scale: 1, duration: 0.10, ease: "power2.out", overwrite: "auto" });
			if (icon) g.to(icon, { scale: 1, duration: 0.10, ease: "power2.out", overwrite: "auto" });
		}
	}

	function playButtonPress(target: HTMLElement, active: boolean): void {
		const g = requireGsap();
		const icon = target.querySelector("svg,.lyrics-word-icon,#quality-btn-label") as HTMLElement | null;
		if (active) {
			g.to(target, { y: 0, scale: 0.91, duration: 0.10, ease: "power2.out", overwrite: "auto" });
			if (icon) g.to(icon, { scale: 0.88, duration: 0.10, ease: "power2.out", overwrite: "auto" });
		} else {
			g.to(target, { y: 0, scale: 1, duration: 0.10, ease: "power2.out", overwrite: "auto" });
			if (icon) g.to(icon, { scale: 1, duration: 0.10, ease: "power2.out", overwrite: "auto" });
		}
	}

	function buttonRelease(target: HTMLElement, optsRelease: { isPlay: boolean; hovered: boolean }): void {
		const g = requireGsap();
		const icon = target.querySelector("svg,.lyrics-word-icon,#quality-btn-label") as HTMLElement | null;
		const { isPlay, hovered } = optsRelease;
		g.to(target, {
			y: hovered ? -2 : 0,
			scale: hovered ? (isPlay ? 1.07 : 1.08) : 1,
			duration: 0.24,
			ease: "back.out(1.9)",
			overwrite: "auto",
		});
		if (icon) {
			g.to(icon, { scale: hovered ? 1.06 : 1, duration: 0.22, ease: "back.out(1.8)", overwrite: "auto" });
		}
	}

	function clickPulse(target: HTMLElement, kind: ButtonKind): void {
		const g = requireGsap();
		const isPlay = kind === "play";
		const pulseSize = isPlay ? 18 : 10;
		const pulseColor = isPlay ? "rgba(255,63,85,.34)" : "rgba(255,255,255,.22)";
		const icon = target.querySelector("svg,.lyrics-word-icon,#quality-btn-label") as HTMLElement | null;
		g.killTweensOf(target, "boxShadow");
		g.fromTo(
			target,
			{ boxShadow: "0 0 0 0 " + pulseColor },
			{
				boxShadow: "0 0 0 " + pulseSize + "px rgba(255,63,85,0)",
				duration: isPlay ? 0.58 : 0.42,
				ease: "sine.out",
				overwrite: false,
				onComplete() {
					if (disposed) return;
					g.set(target, { clearProps: "boxShadow" });
				},
			},
		);
		if (icon) {
			g.fromTo(icon, { rotate: isPlay ? 0 : -5 }, { rotate: 0, duration: 0.34, ease: "elastic.out(1,0.55)" } as Record<string, unknown>);
		}
	}

	function toggleModeButton(currentNext?: string): void {
		if (disposed) return;
		const btn = root.modeButton;
		const icon = root.modeIcon;
		if (!btn) return;
		const g = requireGsap();
		g.killTweensOf(btn);
		if (icon) g.killTweensOf(icon);
		const tl = g.timeline({ defaults: { overwrite: true } });
		tl.fromTo(btn, { scale: 0.86, rotate: -8 }, { scale: 1.12, rotate: 4, duration: 0.16, ease: "power2.out" });
		tl.to(btn, { scale: 1, rotate: 0, duration: 0.34, ease: "back.out(2.1)" });
		g.fromTo(
			btn,
			{ boxShadow: "0 0 0 0 rgba(255,63,85,.36)" },
			{
				boxShadow: "0 0 0 14px rgba(255,63,85,0)",
				duration: 0.58,
				ease: "sine.out",
				overwrite: false,
				onComplete() {
					if (disposed) return;
					g.set(btn, { clearProps: "boxShadow" });
				},
			},
		);
		if (icon) {
			g.fromTo(icon, { y: 4, autoAlpha: 0.32, rotate: -22, scale: 0.74 }, { y: 0, autoAlpha: 1, rotate: 0, scale: 1, duration: 0.42, ease: "expo.out", overwrite: true });
		}
		void currentNext;
	}

	function animateListItems(items: HTMLElement[], optsAnimate: ListAnimateOptions = {}): void {
		if (disposed || items.length === 0) return;
		const g = requireGsap();
		const limit = optsAnimate.limit ?? 18;
		const targets = items.slice(0, limit);
		g.killTweensOf(targets);
		g.fromTo(
			targets,
			{
				autoAlpha: 0,
				y: optsAnimate.y == null ? 8 : optsAnimate.y,
				x: optsAnimate.x == null ? -6 : optsAnimate.x,
			},
			{
				autoAlpha: 1,
				y: 0,
				x: 0,
				duration: optsAnimate.duration ?? 0.22,
				stagger: optsAnimate.stagger ?? 0.012,
				ease: optsAnimate.ease ?? "power2.out",
				force3D: true,
				overwrite: true,
			},
		);
	}

	function installSmoothWheel(scrollEl: HTMLElement): () => void {
		if (disposed || !scrollEl) return () => {};
		observedScrollTargets.add(scrollEl);
		let tween: GsapTweenLike | null = null;
		let targetTop = scrollEl.scrollTop;

		const onWheel = (e: WheelEvent) => {
			if (disposed) return;
			const g = gsap;
			if (!g) return;
			if (e.ctrlKey) return;
			const max = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight);
			if (max <= 0 || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
			let delta = e.deltaY;
			if (e.deltaMode === 1) delta *= 18;
			else if (e.deltaMode === 2) delta *= scrollEl.clientHeight;
			const current = tween ? targetTop : scrollEl.scrollTop;
			const next = Math.max(0, Math.min(max, current + delta));
			if (next === current && ((delta < 0 && scrollEl.scrollTop <= 0) || (delta > 0 && scrollEl.scrollTop >= max - 1))) {
				targetTop = scrollEl.scrollTop;
				return;
			}
			e.preventDefault();
			targetTop = next;
			if (tween) tween.kill();
			tween = g.to(scrollEl, {
				scrollTop: targetTop,
				duration: 0.24,
				ease: "power2.out",
				overwrite: true,
				onComplete() {
					tween = null;
					targetTop = scrollEl.scrollTop;
				},
			} as Record<string, unknown>);
		};
		const onScroll = () => {
			if (!tween) targetTop = scrollEl.scrollTop;
		};

		scrollEl.addEventListener("wheel", onWheel, { passive: false });
		scrollEl.addEventListener("scroll", onScroll, { passive: true });

		const cleanup = () => {
			scrollEl.removeEventListener("wheel", onWheel);
			scrollEl.removeEventListener("scroll", onScroll);
			if (tween) tween.kill();
			tween = null;
			observedScrollTargets.delete(scrollEl);
		};
		unsubscribers.push(cleanup);
		return cleanup;
	}

	function dispose(): void {
		if (disposed) return;
		disposed = true;
		while (hideTimers.length) {
			const t = hideTimers.pop();
			if (t) clearTimeout(t);
		}
		while (unsubscribers.length) {
			const fn = unsubscribers.pop();
			if (fn) fn();
		}
		if (gsap) {
			for (const el of observedScrollTargets) {
				gsap.killTweensOf(el);
			}
			if (root.bar) gsap.killTweensOf(root.bar);
			if (root.modeButton) gsap.killTweensOf(root.modeButton);
			if (root.modeIcon) gsap.killTweensOf(root.modeIcon);
			for (const btn of root.normalButtons) gsap.killTweensOf(btn);
			if (root.playButton) gsap.killTweensOf(root.playButton);
		}
		observedScrollTargets.clear();
		gsap = null;
		ready = false;
	}

	return {
		async init() {
			if (ready) return;
			gsap = await gsapProvider();
			ready = true;
		},
		reveal,
		setHidden,
		playButtonHover,
		normalButtonHover,
		buttonPress,
		playButtonPress,
		buttonRelease,
		clickPulse,
		toggleModeButton,
		animateListItems,
		installSmoothWheel,
		dispose,
	};
}
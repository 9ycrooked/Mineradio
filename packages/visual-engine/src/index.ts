export type VisualEngineSnapshot = {
	preset: string;
	playing: boolean;
};

export type VisualEngine = {
	update(snapshot: VisualEngineSnapshot): void;
	resize(size: { width: number; height: number }): void;
	dispose(): void;
};

export function createVisualEngine(): VisualEngine {
	return {
		update() {},
		resize() {},
		dispose() {},
	};
}

export { createSplashEngine } from "./splash/splash-engine";
export type { SplashEngine, SplashEngineOptions } from "./splash/splash-engine";
export { createSplashWebgl, SPLASH_VERTEX_SHADER, SPLASH_FRAGMENT_SHADER } from "./splash/splash-webgl";
export { createSplashCanvas } from "./splash/splash-canvas";
export { SPLASH_CSS, injectSplashStyle } from "./splash/splash-style";

export { CONTROL_GLASS_CSS, injectControlGlassStyle } from "./control/control-glass-style";
export {
	generateControlGlassDisplacementMap,
	createControlGlassSvg,
	supportsControlGlassSvgFilter,
	CONTROL_GLASS_FILTER_MARKUP,
	CONTROL_GLASS_SVG_ID,
} from "./control/control-glass-svg";
export { attachControlGlassNode } from "./control/control-glass-node";
export type { ControlGlassNodeOptions } from "./control/control-glass-node";
export {
	createControlConsoleMotion,
} from "./control/control-console-motion";
export type {
	GsapLike,
	GsapTweenLike,
	GsapTimelineLike,
	GsapProvider,
	ButtonKind,
	ConsoleMotionRoot,
	ConsoleMotionDeps,
	ControlConsoleMotion,
	ListAnimateOptions,
	CreateControlConsoleMotionOptions,
} from "./control/control-console-motion";
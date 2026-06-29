import type * as THREE from "three";

export type ThreeModule = typeof import("three");
export type ThreeFactory = () => ThreeModule | Promise<ThreeModule>;

export interface RendererSetupOptions {
	threeFactory?: ThreeFactory;
	antialias?: boolean;
	alpha?: boolean;
	powerPreference?: "high-performance" | "default" | "low-power";
	pixelRatio?: number;
}

export interface RendererResizeOptions {
	width?: number;
	height?: number;
	pixelRatio?: number;
}

export interface RendererHandle {
	readonly renderer: THREE.WebGLRenderer;
	readonly scene: THREE.Scene;
	readonly camera: THREE.PerspectiveCamera;
	resize(opts?: RendererResizeOptions): void;
	dispose(): void;
}

interface ResizeSyncWindowLike {
	devicePixelRatio?: number;
	addEventListener(type: "resize", listener: EventListener): void;
	removeEventListener(type: "resize", listener: EventListener): void;
	setTimeout(callback: () => void, delay: number): number;
	clearTimeout(id: number): void;
}

interface ResizeObserverLike {
	observe(target: Element): void;
	disconnect(): void;
}

type ResizeObserverFactory = new (callback: () => void) => ResizeObserverLike;

export interface RendererResizeSyncOptions {
	window?: ResizeSyncWindowLike;
	resizeObserverFactory?: ResizeObserverFactory | null;
}

const defaultThreeFactory: ThreeFactory = async () => await import("three");

export async function createRenderer(
	container: HTMLElement,
	opts: RendererSetupOptions = {},
): Promise<RendererHandle> {
	const factory = opts.threeFactory ?? defaultThreeFactory;
	const THREE = await factory();
	const scene = new THREE.Scene();
	scene.background = null;
	const camera = new THREE.PerspectiveCamera(45, getAspect(container), 0.1, 100);
	const renderer = new THREE.WebGLRenderer({
		antialias: opts.antialias ?? false,
		alpha: opts.alpha ?? true,
		powerPreference: opts.powerPreference ?? "high-performance",
	});
	renderer.setClearColor(0x000000, 0);
	const pixelRatio = opts.pixelRatio ?? getDevicePixelRatio();
	renderer.setPixelRatio(pixelRatio);
	renderer.setSize(container.clientWidth || 1, container.clientHeight || 1);
	renderer.domElement.style.background = "transparent";
	renderer.domElement.style.display = "block";
	renderer.domElement.style.width = "100%";
	renderer.domElement.style.height = "100%";
	container.appendChild(renderer.domElement);
	function resize(resizeOpts: RendererResizeOptions = {}): void {
		const width = Math.max(1, resizeOpts.width ?? container.clientWidth ?? 1);
		const height = Math.max(1, resizeOpts.height ?? container.clientHeight ?? 1);
		const nextPixelRatio = resizeOpts.pixelRatio ?? opts.pixelRatio ?? getDevicePixelRatio();
		renderer.setPixelRatio(nextPixelRatio);
		renderer.setSize(width, height, false);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	}
	return {
		renderer,
		scene,
		camera,
		resize,
		dispose() {
			try {
				renderer.dispose();
			} catch {
			}
			try {
				if (renderer.domElement.parentElement === container) {
					container.removeChild(renderer.domElement);
				}
			} catch {
			}
		},
	};
}

export function attachRendererResizeSync(
	container: HTMLElement,
	handle: RendererHandle,
	opts: RendererResizeSyncOptions = {},
): () => void {
	const win = opts.window ?? getWindowLike();
	const timers: number[] = [];
	let disposed = false;
	function refresh(): void {
		if (disposed) return;
		handle.resize({
			width: container.clientWidth || undefined,
			height: container.clientHeight || undefined,
			pixelRatio: getDevicePixelRatio(win),
		});
	}
	function schedule(): void {
		refresh();
		for (const delay of [48, 140, 320]) {
			timers.push(win.setTimeout(refresh, delay));
		}
	}
	win.addEventListener("resize", schedule);
	let observer: ResizeObserverLike | null = null;
	const ObserverCtor = opts.resizeObserverFactory ?? getResizeObserverFactory(win);
	if (ObserverCtor) {
		try {
			observer = new ObserverCtor(schedule);
			observer.observe(container);
		} catch {
			observer = null;
		}
	}
	return () => {
		disposed = true;
		win.removeEventListener("resize", schedule);
		for (const timer of timers.splice(0)) {
			win.clearTimeout(timer);
		}
		try {
			observer?.disconnect();
		} catch {
		}
	};
}

function getAspect(container: HTMLElement): number {
	const w = container.clientWidth || 1;
	const h = container.clientHeight || 1;
	return w / h;
}

function getWindowLike(): ResizeSyncWindowLike {
	if (typeof window !== "undefined") {
		return window;
	}
	return {
		devicePixelRatio: 1,
		addEventListener() {},
		removeEventListener() {},
		setTimeout(callback: () => void) {
			callback();
			return 0;
		},
		clearTimeout() {},
	};
}

function getResizeObserverFactory(win: ResizeSyncWindowLike): ResizeObserverFactory | null {
	const maybeWindow = win as ResizeSyncWindowLike & { ResizeObserver?: ResizeObserverFactory };
	if (typeof maybeWindow.ResizeObserver === "function") return maybeWindow.ResizeObserver;
	if (typeof ResizeObserver !== "undefined") return ResizeObserver;
	return null;
}

function getDevicePixelRatio(win: Pick<ResizeSyncWindowLike, "devicePixelRatio"> = getWindowLike()): number {
	if (typeof win.devicePixelRatio === "number") {
		return Math.min(win.devicePixelRatio || 1, 1.35);
	}
	return 1;
}

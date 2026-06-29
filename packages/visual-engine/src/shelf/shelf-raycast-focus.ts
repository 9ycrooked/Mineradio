import type * as THREE from "three";
import type { ShelfManager, ShelfRaycastCardHit, ShelfRaycastContentRowHit } from "./shelf-animate";

export interface ShelfPointerRaycastInfo {
	clientX: number;
	clientY: number;
	viewportWidth: number;
	viewportHeight: number;
	screenPad?: number;
}

export type ShelfPointerRaycastFocusGetter = (pointer: ShelfPointerRaycastInfo) => boolean;
export type ShelfPointerRaycastHitGetter = (pointer: ShelfPointerRaycastInfo) => ShelfRaycastCardHit | null;
export type ShelfPointerContentRowRaycastHitGetter = (pointer: ShelfPointerRaycastInfo) => ShelfRaycastContentRowHit | null;

export interface ShelfPointerRaycastFocusOptions {
	camera: THREE.Camera;
	shelfManager: Pick<ShelfManager, "getMode" | "raycastCards" | "pickCardAtScreen">;
	three?: Pick<typeof import("three"), "Raycaster" | "Vector2">;
	getScreenPad?: (pointer: ShelfPointerRaycastInfo) => number | undefined;
}

export interface ShelfPointerRaycastHitOptions {
	camera: THREE.Camera;
	shelfManager: Pick<ShelfManager, "raycastCards" | "pickCardAtScreen">;
	three?: Pick<typeof import("three"), "Raycaster" | "Vector2">;
}

export interface ShelfPointerStrictRaycastHitOptions {
	camera: THREE.Camera;
	shelfManager: Pick<ShelfManager, "raycastCards">;
	three?: Pick<typeof import("three"), "Raycaster" | "Vector2">;
}

export interface ShelfPointerContentRowRaycastHitOptions {
	camera: THREE.Camera;
	shelfManager: Pick<ShelfManager, "raycastContentRows">;
	three?: Pick<typeof import("three"), "Raycaster" | "Vector2">;
}

function setRaycasterFromPointer(
	raycaster: Pick<THREE.Raycaster, "setFromCamera">,
	pointerNdc: Pick<THREE.Vector2, "set">,
	camera: THREE.Camera,
	pointer: ShelfPointerRaycastInfo,
): boolean {
	if (pointer.viewportWidth <= 0 || pointer.viewportHeight <= 0) return false;
	pointerNdc.set(
		(pointer.clientX / pointer.viewportWidth) * 2 - 1,
		-(pointer.clientY / pointer.viewportHeight) * 2 + 1,
	);
	raycaster.setFromCamera(pointerNdc as THREE.Vector2, camera);
	return true;
}

export async function createShelfPointerRaycastHitGetter(
	opts: ShelfPointerRaycastHitOptions,
): Promise<ShelfPointerRaycastHitGetter> {
	const three = opts.three ?? await import("three");
	const raycaster = new three.Raycaster();
	const pointerNdc = new three.Vector2();
	return (pointer) => {
		if (!setRaycasterFromPointer(raycaster, pointerNdc, opts.camera, pointer)) return null;
		return opts.shelfManager.raycastCards(raycaster) ||
			opts.shelfManager.pickCardAtScreen(
				pointer.clientX,
				pointer.clientY,
				pointer.viewportWidth,
				pointer.viewportHeight,
				opts.camera,
				pointer.screenPad,
			);
	};
}

export async function createShelfPointerStrictRaycastHitGetter(
	opts: ShelfPointerStrictRaycastHitOptions,
): Promise<ShelfPointerRaycastHitGetter> {
	const three = opts.three ?? await import("three");
	const raycaster = new three.Raycaster();
	const pointerNdc = new three.Vector2();
	return (pointer) => {
		if (!setRaycasterFromPointer(raycaster, pointerNdc, opts.camera, pointer)) return null;
		return opts.shelfManager.raycastCards(raycaster);
	};
}

export async function createShelfPointerContentRowRaycastHitGetter(
	opts: ShelfPointerContentRowRaycastHitOptions,
): Promise<ShelfPointerContentRowRaycastHitGetter> {
	const three = opts.three ?? await import("three");
	const raycaster = new three.Raycaster();
	const pointerNdc = new three.Vector2();
	return (pointer) => {
		if (!setRaycasterFromPointer(raycaster, pointerNdc, opts.camera, pointer)) return null;
		return opts.shelfManager.raycastContentRows(raycaster);
	};
}

export async function createShelfPointerRaycastFocus(
	opts: ShelfPointerRaycastFocusOptions,
): Promise<ShelfPointerRaycastFocusGetter> {
	const getHit = await createShelfPointerRaycastHitGetter(opts);
	return (pointer) => {
		if (opts.shelfManager.getMode() !== "side") return false;
		return getHit({
			...pointer,
			screenPad: opts.getScreenPad?.(pointer),
		}) !== null;
	};
}

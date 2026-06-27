import type { ShelfRaycastCardHit } from "./shelf-animate";
import type { ShelfCardAction } from "./shelf-card-sprite";

export type ShelfPrimaryHit = Pick<ShelfRaycastCardHit, "index" | "item" | "mesh" | "point" | "uv">;

export type ShelfPrimaryActivationResult =
	| { kind: "scroll"; index: number; delta: number }
	| { kind: "playQueue"; index: number; cardIndex: number }
	| { kind: "openDetail"; index: number; action: Extract<ShelfCardAction, { kind: "loadPlaylist" }> }
	| { kind: "openQueuePanel"; index: number }
	| { kind: "none"; index: number };

export interface ShelfPrimaryActivationOptions {
	hit: ShelfPrimaryHit;
	getCenterIdx: () => number;
	scrollBy: (delta: number) => void;
	openDetail?: (index: number, opts?: { playlistId?: string; title?: string }) => void;
	onPlayQueueIndex?: (index: number) => void;
	onOpenDetail?: (
		hit: ShelfPrimaryHit,
		action: Extract<ShelfCardAction, { kind: "loadPlaylist" }>,
	) => void;
	onOpenQueuePanel?: () => void;
}

export function getShelfCardAction(hit: ShelfPrimaryHit): ShelfCardAction | null {
	const action = (hit.mesh.userData as { action?: unknown } | undefined)?.action;
	if (!action || typeof action !== "object") return null;
	const kind = (action as { kind?: unknown }).kind;
	if (kind === "loadPlaylist" || kind === "playQueue" || kind === "empty") {
		return action as ShelfCardAction;
	}
	return null;
}

export function activateShelfPrimaryHit(
	opts: ShelfPrimaryActivationOptions,
): ShelfPrimaryActivationResult {
	const centerIdx = opts.getCenterIdx();
	const delta = opts.hit.index - centerIdx;
	if (delta !== 0) {
		opts.scrollBy(delta);
		return { kind: "scroll", index: opts.hit.index, delta };
	}

	const action = getShelfCardAction(opts.hit);
	if (!action) return { kind: "none", index: opts.hit.index };
	if (action.kind === "playQueue") {
		const queueIndex = Number.isFinite(action.index) ? Number(action.index) : opts.hit.index;
		opts.onPlayQueueIndex?.(queueIndex);
		return { kind: "playQueue", index: queueIndex, cardIndex: opts.hit.index };
	}
	if (action.kind === "loadPlaylist") {
		opts.openDetail?.(opts.hit.index, {
			playlistId: action.playlistId,
			title: action.title,
		});
		opts.onOpenDetail?.(opts.hit, action);
		return { kind: "openDetail", index: opts.hit.index, action };
	}
	opts.onOpenQueuePanel?.();
	return { kind: "openQueuePanel", index: opts.hit.index };
}

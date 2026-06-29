import { expect, test } from "bun:test";
import { activateShelfPrimaryHit, type ShelfPrimaryHit } from "./shelf-activation";
import type { ShelfCardAction } from "./shelf-card-sprite";

function makeHit(index: number, action: ShelfCardAction, uv?: { x: number; y: number }): ShelfPrimaryHit {
	return {
		index,
		item: { title: `Card ${index}` },
		mesh: { userData: { action } } as never,
		uv: uv as never,
	};
}

test("activateShelfPrimaryHit scrolls non-centered card hits instead of running actions", () => {
	const scrolled: number[] = [];
	const result = activateShelfPrimaryHit({
		hit: makeHit(4, { kind: "playQueue", index: 9 }),
		getCenterIdx: () => 2,
		scrollBy: (delta) => scrolled.push(delta),
	});

	expect(result).toEqual({ kind: "scroll", index: 4, delta: 2 });
	expect(scrolled).toEqual([2]);
});

test("activateShelfPrimaryHit plays centered queue cards through callback", () => {
	const played: number[] = [];
	const result = activateShelfPrimaryHit({
		hit: makeHit(2, { kind: "playQueue", index: 7 }),
		getCenterIdx: () => 2,
		scrollBy: () => {
			throw new Error("centered cards should not scroll");
		},
		onPlayQueueIndex: (index) => played.push(index),
	});

	expect(result).toEqual({ kind: "playQueue", index: 7, cardIndex: 2 });
	expect(played).toEqual([7]);
});

test("activateShelfPrimaryHit opens detail for centered playlist cards and reports action", () => {
	const opened: number[] = [];
	const callbackHits: Array<{ index: number; action: ShelfCardAction }> = [];
	const action: ShelfCardAction = { kind: "loadPlaylist", playlistId: "p1", title: "Mix" };
	const result = activateShelfPrimaryHit({
		hit: makeHit(1, action),
		getCenterIdx: () => 1,
		scrollBy: () => {},
		openDetail: (idx) => opened.push(idx),
		onOpenDetail: (hit, hitAction) => callbackHits.push({ index: hit.index, action: hitAction }),
	});

	expect(result).toEqual({ kind: "openDetail", index: 1, action });
	expect(opened).toEqual([1]);
	expect(callbackHits).toEqual([{ index: 1, action }]);
});

test("activateShelfPrimaryHit plays centered playlist cards through the baseline card hotspot", () => {
	const opened: number[] = [];
	const played: Array<{ index: number; action: ShelfCardAction }> = [];
	const action: ShelfCardAction = { kind: "loadPlaylist", playlistId: "p1", title: "Mix" };
	const result = activateShelfPrimaryHit({
		hit: makeHit(1, action, { x: 0.6, y: 0.2 }),
		getCenterIdx: () => 1,
		scrollBy: () => {},
		openDetail: (idx) => opened.push(idx),
		onPlayPlaylist: (hit, hitAction) => played.push({ index: hit.index, action: hitAction }),
	});

	expect(result).toEqual({ kind: "playPlaylist", index: 1, action });
	expect(opened).toEqual([]);
	expect(played).toEqual([{ index: 1, action }]);
});

test("activateShelfPrimaryHit keeps centered playlist clicks outside the play hotspot as detail opens", () => {
	const opened: number[] = [];
	const played: unknown[] = [];
	const action: ShelfCardAction = { kind: "loadPlaylist", playlistId: "p1", title: "Mix" };
	const result = activateShelfPrimaryHit({
		hit: makeHit(1, action, { x: 0.48, y: 0.2 }),
		getCenterIdx: () => 1,
		scrollBy: () => {},
		openDetail: (idx) => opened.push(idx),
		onPlayPlaylist: () => played.push("play"),
	});

	expect(result).toEqual({ kind: "openDetail", index: 1, action });
	expect(opened).toEqual([1]);
	expect(played).toEqual([]);
});

test("activateShelfPrimaryHit reports centered empty cards through optional callback", () => {
	const openedQueuePanel: number[] = [];
	const result = activateShelfPrimaryHit({
		hit: makeHit(0, { kind: "empty" }),
		getCenterIdx: () => 0,
		scrollBy: () => {},
		onOpenQueuePanel: () => openedQueuePanel.push(1),
	});

	expect(result).toEqual({ kind: "openQueuePanel", index: 0 });
	expect(openedQueuePanel).toEqual([1]);
});

import type * as THREE from "three";
import type { ShelfItem } from "./shelf-animate";

export const SHELF_CARD_CANVAS_WIDTH = 720;
export const SHELF_CARD_CANVAS_HEIGHT = 360;
export const SHELF_CARD_GEOMETRY_WIDTH = 2.05;
export const SHELF_CARD_GEOMETRY_HEIGHT = 1.025;

export interface ShelfCardDrawState {
	index: number;
	centered?: boolean;
	selected?: boolean;
	bgOpacity?: number;
	beatProgress?: number;
	dimmed?: boolean;
}

export type ShelfCardAction =
	| { kind: "loadPlaylist"; playlistId?: string; title?: string; provider?: string }
	| { kind: "playQueue"; index?: number }
	| { kind: "empty" };

export interface ShelfCardSprite {
	readonly canvas: HTMLCanvasElement;
	readonly context: CanvasRenderingContext2D;
	readonly texture: THREE.CanvasTexture;
	readonly geometry: THREE.PlaneGeometry;
	readonly material: THREE.MeshBasicMaterial;
	readonly mesh: THREE.Mesh;
	update(item: ShelfItem, state?: ShelfCardDrawState): void;
	dispose(): void;
}

export interface CreateShelfCardMeshOptions {
	item: ShelfItem;
	index: number;
	three: typeof import("three");
	createCanvas?: () => HTMLCanvasElement;
	drawState?: ShelfCardDrawState;
}

export function makeShelfCardAction(item: ShelfItem): ShelfCardAction {
	if (item.type === "podcastCollection") {
		return {
			kind: "loadPlaylist",
			playlistId: item.podcastKey ? `podcast:${item.podcastKey}` : undefined,
			title: item.title,
		};
	}
	if (item.type === "queue") {
		return { kind: "playQueue", index: item.queueIndex };
	}
	if (item.type !== "playlist") {
		return { kind: "empty" };
	}
	return {
		kind: "loadPlaylist",
		playlistId: item.playlistId,
		title: item.title,
		provider: item.provider,
	};
}

export function createShelfCardMesh(opts: CreateShelfCardMeshOptions): ShelfCardSprite {
	const canvas = opts.createCanvas ? opts.createCanvas() : createDefaultCanvas();
	canvas.width = SHELF_CARD_CANVAS_WIDTH;
	canvas.height = SHELF_CARD_CANVAS_HEIGHT;
	const context = canvas.getContext("2d");
	if (!context) throw new Error("Shelf card canvas 2d context is unavailable");

	const texture = new opts.three.CanvasTexture(canvas);
	texture.minFilter = opts.three.LinearFilter;
	texture.magFilter = opts.three.LinearFilter;
	texture.generateMipmaps = false;
	const material = new opts.three.MeshBasicMaterial({
		map: texture,
		transparent: true,
		opacity: 0.96,
		depthWrite: false,
		depthTest: false,
		side: opts.three.DoubleSide,
	});
	const geometry = new opts.three.PlaneGeometry(
		SHELF_CARD_GEOMETRY_WIDTH,
		SHELF_CARD_GEOMETRY_HEIGHT,
		1,
		1,
	);
	const mesh = new opts.three.Mesh(geometry, material);
	mesh.renderOrder = 50 + opts.index;
	mesh.userData.shelfCardIndex = opts.index;
	mesh.userData.action = makeShelfCardAction(opts.item);

	const sprite: ShelfCardSprite = {
		canvas,
		context,
		texture,
		geometry,
		material,
		mesh,
		update(item, state = { index: opts.index }) {
			drawShelfCard(context, item, state);
			texture.needsUpdate = true;
			mesh.userData.action = makeShelfCardAction(item);
		},
		dispose() {
			texture.dispose();
			material.dispose();
			geometry.dispose();
		},
	};
	sprite.update(opts.item, opts.drawState ?? { index: opts.index });
	return sprite;
}

export function drawShelfCard(
	ctx: CanvasRenderingContext2D,
	item: ShelfItem,
	state: ShelfCardDrawState,
): void {
	const w = SHELF_CARD_CANVAS_WIDTH;
	const h = SHELF_CARD_CANVAS_HEIGHT;
	const centered = !!state.centered;
	const selected = !!state.selected;
	const bgOpacity = state.bgOpacity ?? 0.58;
	const title = item.title || "未命名歌单";
	const sub = item.sub || (item.type === "queue" ? "播放队列" : "Playlist");
	const tag = item.tag || defaultTagForItem(item);

	ctx.clearRect(0, 0, w, h);
	ctx.save();
	roundRectPath(ctx, 18, 18, w - 36, h - 36, 34);
	ctx.fillStyle = `rgba(0,0,0,${bgOpacity})`;
	ctx.fill();

	const sheen = ctx.createLinearGradient(18, 18, w - 18, h - 18);
	sheen.addColorStop(0, "rgba(255,255,255,0.18)");
	sheen.addColorStop(0.42, "rgba(255,255,255,0.045)");
	sheen.addColorStop(1, "rgba(255,255,255,0.018)");
	ctx.fillStyle = sheen;
	ctx.fill();

	ctx.lineWidth = selected || item.type === "queue" ? 4 : 2;
	ctx.strokeStyle = selected || item.type === "queue"
		? "rgba(122,240,255,0.82)"
		: "rgba(255,255,255,0.22)";
	ctx.stroke();

	if (selected) {
		ctx.shadowColor = "rgba(122,240,255,0.52)";
		ctx.shadowBlur = 28;
		ctx.strokeStyle = "rgba(122,240,255,0.42)";
		ctx.lineWidth = 9;
		ctx.stroke();
		ctx.shadowBlur = 0;
	}

	drawCover(ctx, item, centered);
	drawTextBlock(ctx, tag, title, sub, centered);
	drawBeatLine(ctx, state.beatProgress ?? 0, selected || item.type === "queue");
	if (centered) drawCenterActions(ctx, item);
	if (state.dimmed) drawDofOverlay(ctx);
	ctx.restore();
}

function createDefaultCanvas(): HTMLCanvasElement {
	if (typeof document === "undefined" || typeof document.createElement !== "function") {
		throw new Error("Shelf card canvas requires a document or injected createCanvas");
	}
	return document.createElement("canvas");
}

function roundRectPath(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
): void {
	ctx.beginPath();
	const maybeRoundRect = ctx as CanvasRenderingContext2D & {
		roundRect?: (x: number, y: number, w: number, h: number, r: number) => void;
	};
	if (typeof maybeRoundRect.roundRect === "function") {
		maybeRoundRect.roundRect(x, y, w, h, r);
		return;
	}
	ctx.moveTo(x + r, y);
	ctx.lineTo(x + w - r, y);
	ctx.lineTo(x + w, y + r);
	ctx.lineTo(x + w, y + h - r);
	ctx.lineTo(x + w - r, y + h);
	ctx.lineTo(x + r, y + h);
	ctx.lineTo(x, y + h - r);
	ctx.lineTo(x, y + r);
}

function drawCover(ctx: CanvasRenderingContext2D, item: ShelfItem, centered: boolean): void {
	const x = 56;
	const y = 82;
	const size = 198;
	roundRectPath(ctx, x, y, size, size, 24);
	const grad = ctx.createLinearGradient(x, y, x + size, y + size);
	grad.addColorStop(0, centered ? "rgba(122,240,255,0.44)" : "rgba(255,255,255,0.20)");
	grad.addColorStop(1, "rgba(255,255,255,0.045)");
	ctx.fillStyle = grad;
	ctx.fill();
	ctx.strokeStyle = "rgba(255,255,255,0.18)";
	ctx.lineWidth = 2;
	ctx.stroke();

	ctx.fillStyle = "rgba(255,255,255,0.72)";
	ctx.font = "700 44px system-ui, sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	const mark = item.type === "queue" ? "Q" : (item.title || "M").slice(0, 1).toUpperCase();
	ctx.fillText(mark, x + size / 2, y + size / 2);
}

function drawTextBlock(
	ctx: CanvasRenderingContext2D,
	tag: string,
	title: string,
	sub: string,
	centered: boolean,
): void {
	ctx.textAlign = "left";
	ctx.textBaseline = "alphabetic";
	ctx.font = "700 24px system-ui, sans-serif";
	ctx.fillStyle = centered ? "rgba(122,240,255,0.88)" : "rgba(255,255,255,0.62)";
	ctx.fillText(trimToWidth(ctx, tag, 330), 292, 116);

	ctx.font = "800 42px system-ui, sans-serif";
	ctx.fillStyle = "rgba(255,255,255,0.94)";
	ctx.fillText(trimToWidth(ctx, title, 360), 292, 176);

	ctx.font = "500 25px system-ui, sans-serif";
	ctx.fillStyle = "rgba(255,255,255,0.58)";
	ctx.fillText(trimToWidth(ctx, sub, 360), 292, 224);
}

function drawBeatLine(ctx: CanvasRenderingContext2D, progress: number, accent: boolean): void {
	const x = 292;
	const y = 274;
	const w = 342;
	ctx.lineCap = "round";
	ctx.lineWidth = 5;
	ctx.strokeStyle = "rgba(255,255,255,0.14)";
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + w, y);
	ctx.stroke();
	ctx.strokeStyle = accent ? "rgba(122,240,255,0.88)" : "rgba(255,255,255,0.44)";
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.lineTo(x + w * clamp01(progress), y);
	ctx.stroke();
}

function drawCenterActions(ctx: CanvasRenderingContext2D, item: ShelfItem): void {
	ctx.font = "700 20px system-ui, sans-serif";
	ctx.fillStyle = "rgba(255,255,255,0.78)";
	if (item.type === "queue") {
		ctx.fillText("点击播放", 292, 320);
		return;
	}
	ctx.fillText("▶ 播放歌单", 292, 320);
	ctx.fillText("详情", 438, 320);
}

function drawDofOverlay(ctx: CanvasRenderingContext2D): void {
	ctx.fillStyle = "rgba(0,0,0,0.22)";
	roundRectPath(ctx, 18, 18, SHELF_CARD_CANVAS_WIDTH - 36, SHELF_CARD_CANVAS_HEIGHT - 36, 34);
	ctx.fill();
}

function defaultTagForItem(item: ShelfItem): string {
	if (item.type === "podcastCollection") return "PODCAST";
	if (item.type === "queue") return "NOW PLAYING";
	return "PLAYLIST";
}

function trimToWidth(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
	if (ctx.measureText(text).width <= maxWidth) return text;
	let next = text;
	while (next.length > 1 && ctx.measureText(`${next}…`).width > maxWidth) {
		next = next.slice(0, -1);
	}
	return `${next}…`;
}

function clamp01(v: number): number {
	if (v < 0) return 0;
	if (v > 1) return 1;
	return v;
}

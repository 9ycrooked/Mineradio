import type * as THREE from "three";
import type { ShelfContentRow } from "./shelf-content-list";
import {
	SHELF_CONTENT_PANEL_SCREEN_HEIGHT,
	SHELF_CONTENT_PANEL_SCREEN_WIDTH,
	SHELF_CONTENT_ROW_SCREEN_HEIGHT,
	SHELF_CONTENT_ROW_SCREEN_WIDTH,
} from "./shelf-content-list";

export const SHELF_CONTENT_PANEL_CANVAS_WIDTH = 900;
export const SHELF_CONTENT_PANEL_CANVAS_HEIGHT = 1024;
export const SHELF_CONTENT_ROW_CANVAS_WIDTH = 800;
export const SHELF_CONTENT_ROW_CANVAS_HEIGHT = 104;

export interface ShelfContentPanelSprite {
	readonly canvas: HTMLCanvasElement;
	readonly texture: THREE.CanvasTexture;
	readonly geometry: THREE.PlaneGeometry;
	readonly material: THREE.MeshBasicMaterial;
	readonly mesh: THREE.Mesh;
	update(title: string): void;
	dispose(): void;
}

export interface ShelfContentRowSprite {
	readonly canvas: HTMLCanvasElement;
	readonly texture: THREE.CanvasTexture;
	readonly geometry: THREE.PlaneGeometry;
	readonly material: THREE.MeshBasicMaterial;
	readonly mesh: THREE.Mesh;
	index: number;
	row: ShelfContentRow;
	lastCenter: boolean;
	update(row: ShelfContentRow, index: number, centered: boolean): void;
	dispose(): void;
}

export interface ShelfContentSpriteOptions {
	three: typeof import("three");
	createCanvas: () => HTMLCanvasElement;
}

export function createShelfContentPanelSprite(
	opts: ShelfContentSpriteOptions,
	title: string,
): ShelfContentPanelSprite {
	const canvas = opts.createCanvas();
	canvas.width = SHELF_CONTENT_PANEL_CANVAS_WIDTH;
	canvas.height = SHELF_CONTENT_PANEL_CANVAS_HEIGHT;
	const texture = makeTexture(opts.three, canvas);
	const material = new opts.three.MeshBasicMaterial({
		map: texture,
		transparent: true,
		opacity: 0.86,
		depthWrite: false,
		depthTest: false,
		side: opts.three.DoubleSide,
	});
	const geometry = new opts.three.PlaneGeometry(
		SHELF_CONTENT_PANEL_SCREEN_WIDTH,
		SHELF_CONTENT_PANEL_SCREEN_HEIGHT,
		1,
		1,
	);
	const mesh = new opts.three.Mesh(geometry, material);
	mesh.position.set(-0.02, 0, 0.20);
	mesh.renderOrder = 232;
	mesh.userData.shelfContentDetail = true;
	mesh.userData.shelfContentKind = "panel";

	const sprite: ShelfContentPanelSprite = {
		canvas,
		texture,
		geometry,
		material,
		mesh,
		update(nextTitle) {
			drawPanel(canvas, nextTitle);
			texture.needsUpdate = true;
		},
		dispose() {
			texture.dispose();
			material.dispose();
			geometry.dispose();
		},
	};
	sprite.update(title);
	return sprite;
}

export function createShelfContentRowSprite(
	opts: ShelfContentSpriteOptions,
	row: ShelfContentRow,
	index: number,
	centered: boolean,
): ShelfContentRowSprite {
	const canvas = opts.createCanvas();
	canvas.width = SHELF_CONTENT_ROW_CANVAS_WIDTH;
	canvas.height = SHELF_CONTENT_ROW_CANVAS_HEIGHT;
	const texture = makeTexture(opts.three, canvas);
	const material = new opts.three.MeshBasicMaterial({
		map: texture,
		transparent: true,
		opacity: 0.96,
		depthWrite: false,
		depthTest: false,
		side: opts.three.DoubleSide,
	});
	const geometry = new opts.three.PlaneGeometry(
		SHELF_CONTENT_ROW_SCREEN_WIDTH,
		SHELF_CONTENT_ROW_SCREEN_HEIGHT,
		1,
		1,
	);
	const mesh = new opts.three.Mesh(geometry, material);
	mesh.renderOrder = 240 + index;
	mesh.userData.shelfContentDetail = true;
	mesh.userData.shelfContentKind = "row";
	mesh.userData.shelfContentRowIndex = index;

	const sprite: ShelfContentRowSprite = {
		canvas,
		texture,
		geometry,
		material,
		mesh,
		index,
		row,
		lastCenter: centered,
		update(nextRow, nextIndex, nextCentered) {
			this.index = nextIndex;
			this.row = nextRow;
			this.lastCenter = nextCentered;
			mesh.userData.shelfContentRowIndex = nextIndex;
			drawRow(canvas, nextRow, nextIndex, nextCentered);
			texture.needsUpdate = true;
		},
		dispose() {
			texture.dispose();
			material.dispose();
			geometry.dispose();
		},
	};
	sprite.update(row, index, centered);
	return sprite;
}

function makeTexture(
	three: typeof import("three"),
	canvas: HTMLCanvasElement,
): THREE.CanvasTexture {
	const texture = new three.CanvasTexture(canvas);
	texture.minFilter = three.LinearFilter;
	texture.magFilter = three.LinearFilter;
	texture.generateMipmaps = false;
	return texture;
}

function drawPanel(canvas: HTMLCanvasElement, title: string): void {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	const w = canvas.width;
	const h = canvas.height;
	ctx.clearRect(0, 0, w, h);
	roundRectPath(ctx, 24, 28, w - 48, h - 56, 34);
	const bg = ctx.createLinearGradient(0, 0, w, h);
	bg.addColorStop(0, "rgba(0,0,0,0.86)");
	bg.addColorStop(1, "rgba(0,0,0,0.68)");
	ctx.fillStyle = bg;
	ctx.fill();
	ctx.strokeStyle = "rgba(255,255,255,0.16)";
	ctx.lineWidth = 1.4;
	ctx.stroke();
	ctx.font = "800 38px Inter, Microsoft YaHei, Arial";
	ctx.fillStyle = "rgba(255,246,220,0.94)";
	ctx.fillText(trimToWidth(ctx, title || "歌单详情", w - 144), 72, 92);
	ctx.font = "500 18px Inter, Microsoft YaHei, Arial";
	ctx.fillStyle = "rgba(122,240,255,0.62)";
	ctx.fillText("详情列表", 74, 128);
	ctx.fillStyle = "rgba(122,240,255,0.34)";
	ctx.fillRect(72, 154, w - 144, 2);
}

function drawRow(
	canvas: HTMLCanvasElement,
	row: ShelfContentRow,
	index: number,
	centered: boolean,
): void {
	const ctx = canvas.getContext("2d");
	if (!ctx) return;
	const w = canvas.width;
	const h = canvas.height;
	ctx.clearRect(0, 0, w, h);
	roundRectPath(ctx, 14, 10, w - 28, h - 20, 22);
	ctx.fillStyle = centered ? "rgba(8,14,24,0.92)" : "rgba(0,0,0,0.62)";
	ctx.fill();
	ctx.strokeStyle = centered ? "rgba(122,240,255,0.48)" : "rgba(255,255,255,0.10)";
	ctx.lineWidth = centered ? 1.6 : 1;
	ctx.stroke();
	ctx.font = "700 18px Inter, Arial";
	ctx.fillStyle = centered ? "rgba(122,240,255,0.95)" : "rgba(255,255,255,0.34)";
	ctx.fillText(String(index + 1).padStart(2, "0"), 32, 52);
	ctx.font = centered ? "800 24px Inter, Microsoft YaHei, Arial" : "600 20px Inter, Microsoft YaHei, Arial";
	ctx.fillStyle = centered ? "rgba(255,247,224,0.96)" : "rgba(255,255,255,0.80)";
	ctx.fillText(trimToWidth(ctx, row.name || "", w - 206), 82, 44);
	ctx.font = "500 15px Inter, Microsoft YaHei, Arial";
	ctx.fillStyle = centered ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.64)";
	ctx.fillText(trimToWidth(ctx, row.artist || "", w - 206), 82, 72);
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

function trimToWidth(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number,
): string {
	if (ctx.measureText(text).width <= maxWidth) return text;
	let next = text;
	while (next.length > 1 && ctx.measureText(`${next}...`).width > maxWidth) {
		next = next.slice(0, -1);
	}
	return `${next}...`;
}

import { expect, test } from "bun:test";
import {
	deriveLyricPaletteFromCover,
	paintBackCoverColorsFromCover,
	paintFloatColorsFromCover,
	silverBlueLyricPalette,
} from "./cover-colors";

function makeCanvas(width: number, height: number, data: Uint8ClampedArray) {
	return {
		width,
		height,
		getContext(type: string) {
			expect(type).toBe("2d");
			return {
				getImageData() {
					return { data };
				},
			};
		},
	};
}

function rgba(width: number, height: number, fill: (x: number, y: number) => [number, number, number, number]): Uint8ClampedArray {
	const data = new Uint8ClampedArray(width * height * 4);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const [r, g, b, a] = fill(x, y);
			const off = (y * width + x) * 4;
			data[off] = r;
			data[off + 1] = g;
			data[off + 2] = b;
			data[off + 3] = a;
		}
	}
	return data;
}

test("deriveLyricPaletteFromCover preserves baseline saturated-cover scoring and HSL palette mapping", () => {
	const data = rgba(16, 16, (x, y) => (x === 8 && y === 8 ? [200, 80, 20, 255] : [70, 72, 76, 255]));
	const palette = deriveLyricPaletteFromCover(makeCanvas(16, 16, data) as never);
	expect(palette).toEqual({
		primary: "rgb(240,171,137)",
		secondary: "rgb(224,199,92)",
		highlight: "rgb(241,220,198)",
		shadow: "rgba(0,6,10,0.44)",
		glow: "rgba(240,171,137,0.24)",
	});
});

test("deriveLyricPaletteFromCover falls back to baseline silver-blue palette for very dark or low-chroma covers", () => {
	const dark = rgba(16, 16, () => [18, 20, 22, 255]);
	expect(deriveLyricPaletteFromCover(makeCanvas(16, 16, dark) as never)).toEqual(silverBlueLyricPalette());
	const transparent = rgba(16, 16, () => [200, 80, 20, 30]);
	expect(deriveLyricPaletteFromCover(makeCanvas(16, 16, transparent) as never)).toBeNull();
});

test("paintBackCoverColorsFromCover mirrors baseline UV sampling and scales RGB by 0.85", () => {
	const data = rgba(4, 4, (x, y) => [x * 40, y * 50, 200, 255]);
	const out = new Float32Array(6);
	const uv = new Float32Array([0, 0, 0.75, 0.5]);
	const changed = paintBackCoverColorsFromCover(makeCanvas(4, 4, data) as never, uv, out);
	expect(changed).toBe(true);
	expect(out[0]).toBe(0);
	expect(out[1]).toBe(0);
	expect(out[2]).toBeCloseTo(200 / 255 * 0.85, 6);
	expect(out[3]).toBeCloseTo(120 / 255 * 0.85, 6);
	expect(out[4]).toBeCloseTo(100 / 255 * 0.85, 6);
	expect(out[5]).toBeCloseTo(200 / 255 * 0.85, 6);
});

test("paintFloatColorsFromCover samples random cover pixels and scales RGB by 0.95", () => {
	const data = rgba(4, 4, (x, y) => [x * 40, y * 50, 160, 255]);
	const out = new Float32Array(6);
	const randoms = [0.1, 0.1, 0.99, 0.51];
	let i = 0;
	const changed = paintFloatColorsFromCover(makeCanvas(4, 4, data) as never, out, () => randoms[i++] ?? 0);
	expect(changed).toBe(true);
	expect(out[0]).toBe(0);
	expect(out[1]).toBe(0);
	expect(out[2]).toBeCloseTo(160 / 255 * 0.95, 6);
	expect(out[3]).toBeCloseTo(120 / 255 * 0.95, 6);
	expect(out[4]).toBeCloseTo(100 / 255 * 0.95, 6);
	expect(out[5]).toBeCloseTo(160 / 255 * 0.95, 6);
});

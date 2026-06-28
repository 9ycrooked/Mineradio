export interface CoverCanvasLike {
	width: number;
	height: number;
	getContext?: (contextId: "2d") => {
		getImageData?: (sx: number, sy: number, sw: number, sh: number) => { data: Uint8ClampedArray | Uint8Array };
	} | null;
}

export interface CoverLyricPalette {
	primary: string;
	secondary: string;
	highlight: string;
	shadow: string;
	glow: string;
}

interface Hsl {
	h: number;
	s: number;
	l: number;
}

interface Rgb {
	r: number;
	g: number;
	b: number;
}

export function silverBlueLyricPalette(): CoverLyricPalette {
	return {
		primary: "#d8f1ff",
		secondary: "#9db8cf",
		highlight: "#eef7ff",
		shadow: "rgba(0,7,12,0.48)",
		glow: "rgba(138,190,255,0.26)",
	};
}

export function deriveLyricPaletteFromCover(coverCanvas: CoverCanvasLike | null | undefined): CoverLyricPalette | null {
	const sample = readCoverPixels(coverCanvas);
	if (!sample) return null;
	const { data, width, height } = sample;
	let sumR = 0;
	let sumG = 0;
	let sumB = 0;
	let count = 0;
	let best = { score: -1, r: 143, g: 233, b: 255 };
	for (let y = 0; y < height; y += 8) {
		for (let x = 0; x < width; x += 8) {
			const di = (y * width + x) * 4;
			const r = data[di] ?? 0;
			const g = data[di + 1] ?? 0;
			const b = data[di + 2] ?? 0;
			const a = (data[di + 3] ?? 255) / 255;
			if (a < 0.5) continue;
			const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
			const maxC = Math.max(r, g, b);
			const minC = Math.min(r, g, b);
			const chroma = (maxC - minC) / 255;
			const edgePenalty = Math.abs(lum - 0.5);
			const score = chroma * 1.6 + (0.5 - edgePenalty) * 0.45;
			sumR += r;
			sumG += g;
			sumB += b;
			count += 1;
			if (lum > 0.08 && lum < 0.92 && score > best.score) best = { score, r, g, b };
		}
	}
	if (!count) return null;
	const avgL = (sumR / count * 0.299 + sumG / count * 0.587 + sumB / count * 0.114) / 255;
	const hsl = rgbToHsl(best.r, best.g, best.b);
	return lyricTextPaletteFromHsl(hsl, avgL, Math.max(0, best.score));
}

export function paintBackCoverColorsFromCover(
	coverCanvas: CoverCanvasLike | null | undefined,
	uv: ArrayLike<number>,
	outColors: Float32Array,
): boolean {
	const sample = readCoverPixels(coverCanvas);
	if (!sample) return false;
	const { data, width, height } = sample;
	const count = Math.floor(Math.min(outColors.length / 3, uv.length / 2));
	for (let i = 0; i < count; i++) {
		const u = uv[i * 2] ?? 0;
		const v = uv[i * 2 + 1] ?? 0;
		const sx = clampInt(Math.floor(u * width), 0, width - 1);
		const sy = clampInt(Math.floor(v * height), 0, height - 1);
		const di = (sy * width + sx) * 4;
		outColors[i * 3] = ((data[di] ?? 0) / 255) * 0.85;
		outColors[i * 3 + 1] = ((data[di + 1] ?? 0) / 255) * 0.85;
		outColors[i * 3 + 2] = ((data[di + 2] ?? 0) / 255) * 0.85;
	}
	return count > 0;
}

export function paintFloatColorsFromCover(
	coverCanvas: CoverCanvasLike | null | undefined,
	outColors: Float32Array,
	random: () => number = Math.random,
): boolean {
	const sample = readCoverPixels(coverCanvas);
	if (!sample) return false;
	const { data, width, height } = sample;
	const count = Math.floor(outColors.length / 3);
	for (let i = 0; i < count; i++) {
		const sx = clampInt(Math.floor(random() * width), 0, width - 1);
		const sy = clampInt(Math.floor(random() * height), 0, height - 1);
		const di = (sy * width + sx) * 4;
		outColors[i * 3] = ((data[di] ?? 0) / 255) * 0.95;
		outColors[i * 3 + 1] = ((data[di + 1] ?? 0) / 255) * 0.95;
		outColors[i * 3 + 2] = ((data[di + 2] ?? 0) / 255) * 0.95;
	}
	return count > 0;
}

function readCoverPixels(coverCanvas: CoverCanvasLike | null | undefined): { data: Uint8ClampedArray | Uint8Array; width: number; height: number } | null {
	if (!coverCanvas || typeof coverCanvas.getContext !== "function") return null;
	const width = Math.max(1, Math.floor(Number(coverCanvas.width) || 0));
	const height = Math.max(1, Math.floor(Number(coverCanvas.height) || 0));
	const ctx = coverCanvas.getContext("2d");
	if (!ctx?.getImageData) return null;
	try {
		return { data: ctx.getImageData(0, 0, width, height).data, width, height };
	} catch {
		return null;
	}
}

function lyricTextPaletteFromHsl(hsl: Hsl, avgL: number, chroma: number): CoverLyricPalette {
	if (avgL < 0.16 || chroma < 0.08) return silverBlueLyricPalette();
	const hue = hsl.h;
	if (avgL < 0.30 && (hue < 0.06 || hue > 0.86 || (hue > 0.75 && hue < 0.86))) return silverBlueLyricPalette();
	if (avgL > 0.82 && chroma < 0.12) {
		return {
			primary: "#064b5b",
			secondary: "#168c88",
			highlight: "#315f68",
			shadow: "rgba(255,255,255,0.48)",
			glow: "rgba(143,233,255,0.14)",
		};
	}
	const lightText = avgL < 0.52;
	const s = Math.max(0.42, Math.min(0.78, hsl.s + 0.16));
	const c1 = hslToRgb(hsl.h, s, lightText ? 0.74 : 0.34);
	const c2 = hslToRgb((hsl.h + 0.08) % 1, Math.max(0.36, s - 0.10), lightText ? 0.62 : 0.46);
	return {
		primary: rgbCss(c1),
		secondary: rgbCss(c2),
		highlight: rgbCss(hslToRgb((hsl.h + 0.03) % 1, Math.max(0.28, s - 0.18), lightText ? 0.86 : 0.58)),
		shadow: lightText ? "rgba(0,6,10,0.44)" : "rgba(248,253,255,0.40)",
		glow: rgbCss(c1, lightText ? 0.24 : 0.14),
	};
}

function rgbToHsl(r: number, g: number, b: number): Hsl {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0;
	let s = 0;
	const l = (max + min) / 2;
	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
		else if (max === g) h = (b - r) / d + 2;
		else h = (r - g) / d + 4;
		h /= 6;
	}
	return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): Rgb {
	h = ((h % 1) + 1) % 1;
	let r: number;
	let g: number;
	let b: number;
	if (s === 0) {
		r = g = b = l;
	} else {
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hueToRgb(p, q, h + 1 / 3);
		g = hueToRgb(p, q, h);
		b = hueToRgb(p, q, h - 1 / 3);
	}
	return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function hueToRgb(p: number, q: number, t: number): number {
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1 / 6) return p + (q - p) * 6 * t;
	if (t < 1 / 2) return q;
	if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
	return p;
}

function rgbCss(c: Rgb, a?: number): string {
	if (a === undefined) return `rgb(${c.r},${c.g},${c.b})`;
	return `rgba(${c.r},${c.g},${c.b},${a})`;
}

function clampInt(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

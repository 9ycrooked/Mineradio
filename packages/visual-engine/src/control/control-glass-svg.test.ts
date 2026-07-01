import { expect, test } from "bun:test";
import {
	generateControlGlassDisplacementMap,
	createControlGlassSvg,
	CONTROL_GLASS_FILTER_MARKUP,
	CONTROL_GLASS_FILTER_DEFS_MARKUP,
	SEARCH_BOX_GLASS_FILTER_MARKUP,
	SEARCH_PILL_GLASS_FILTER_MARKUP,
	applyControlGlassChromaticOffset,
} from "./control-glass-svg";

test("generateControlGlassDisplacementMap(320,80,50) is byte-equal to the baseline recipe in GLASS_SVG_TEXTURE.md", () => {
	const w = 320;
	const h = 80;
	const r = 50;
	const borderWidth = 0.07;
	const edge = Math.min(w, h) * (borderWidth * 0.5);
	const innerW = Math.max(1, w - edge * 2);
	const innerH = Math.max(1, h - edge * 2);
	const expectedSvg =
		'<svg viewBox="0 0 320 80" xmlns="http://www.w3.org/2000/svg">' +
		"<defs>" +
		'<linearGradient id="glass-red" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/></linearGradient>' +
		'<linearGradient id="glass-blue" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/></linearGradient>' +
		"</defs>" +
		'<rect x="0" y="0" width="320" height="80" fill="black"/>' +
		'<rect x="0" y="0" width="320" height="80" rx="50" fill="url(#glass-red)"/>' +
		'<rect x="0" y="0" width="320" height="80" rx="50" fill="url(#glass-blue)" style="mix-blend-mode:difference"/>' +
		'<rect x="' + edge.toFixed(2) + '" y="' + edge.toFixed(2) + '" width="' + innerW.toFixed(2) + '" height="' + innerH.toFixed(2) + '" rx="50" fill="hsl(0 0% 50% / 1)" style="filter:blur(11px)"/>' +
		"</svg>";
	const expected = "data:image/svg+xml," + encodeURIComponent(expectedSvg);
	const actual = generateControlGlassDisplacementMap(320, 80, 50);
	expect(actual).toEqual(expected);
});

test("generateControlGlassDisplacementMap clamps width/height/radius to baseline minimums (240/48/12)", () => {
	const result = generateControlGlassDisplacementMap(1, 1, 1);
	expect(result).toContain("viewBox%3D%220%200%20240%2048%22");
	expect(result).toContain("rx%3D%2212%22");
});

test("CONTROL_GLASS_FILTER_MARKUP is byte-equal to public/index.html baseline <filter> element (lines 2342-2359)", () => {
	const expected =
		'    <filter id="mineradio-control-glass-filter" color-interpolation-filters="sRGB" x="-12%" y="-28%" width="124%" height="156%">\n' +
		'      <feImage id="control-glass-map" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map"></feImage>\n' +
		'      <feDisplacementMap in="SourceGraphic" in2="map" scale="180" xChannelSelector="R" yChannelSelector="B" result="dispRed"></feDisplacementMap>\n' +
		'      <feOffset in="dispRed" dx="-90" dy="0" result="dispRedShifted"></feOffset>\n' +
		'      <feMerge result="dispRedAligned"><feMergeNode in="SourceGraphic"></feMergeNode><feMergeNode in="dispRedShifted"></feMergeNode></feMerge>\n' +
		'      <feColorMatrix in="dispRedAligned" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red"></feColorMatrix>\n' +
		'      <feDisplacementMap in="SourceGraphic" in2="map" scale="170" xChannelSelector="R" yChannelSelector="B" result="dispGreen"></feDisplacementMap>\n' +
		'      <feOffset in="dispGreen" dx="-90" dy="0" result="dispGreenShifted"></feOffset>\n' +
		'      <feMerge result="dispGreenAligned"><feMergeNode in="SourceGraphic"></feMergeNode><feMergeNode in="dispGreenShifted"></feMergeNode></feMerge>\n' +
		'      <feColorMatrix in="dispGreenAligned" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green"></feColorMatrix>\n' +
		'      <feDisplacementMap in="SourceGraphic" in2="map" scale="160" xChannelSelector="R" yChannelSelector="B" result="dispBlue"></feDisplacementMap>\n' +
		'      <feOffset in="dispBlue" dx="-90" dy="0" result="dispBlueShifted"></feOffset>\n' +
		'      <feMerge result="dispBlueAligned"><feMergeNode in="SourceGraphic"></feMergeNode><feMergeNode in="dispBlueShifted"></feMergeNode></feMerge>\n' +
		'      <feColorMatrix in="dispBlueAligned" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue"></feColorMatrix>\n' +
		'      <feBlend in="red" in2="green" mode="screen" result="rg"></feBlend>\n' +
		'      <feBlend in="rg" in2="blue" mode="screen" result="output"></feBlend>\n' +
		'      <feGaussianBlur in="output" stdDeviation="0.5"></feGaussianBlur>\n' +
		"    </filter>";
	expect(CONTROL_GLASS_FILTER_MARKUP).toEqual(expected);
});

test("SVG filter params preserve the golden baseline: 180/170/160 displacement, dx=-90 dy=0, stdDeviation=0.5, region -12%/-28%/124%/156%", () => {
	expect(CONTROL_GLASS_FILTER_MARKUP).toContain('scale="180"');
	expect(CONTROL_GLASS_FILTER_MARKUP).toContain('scale="170"');
	expect(CONTROL_GLASS_FILTER_MARKUP).toContain('scale="160"');
	expect(CONTROL_GLASS_FILTER_MARKUP).toContain('dx="-90" dy="0"');
	expect(CONTROL_GLASS_FILTER_MARKUP).toContain('stdDeviation="0.5"');
	expect(CONTROL_GLASS_FILTER_MARKUP).toContain('x="-12%" y="-28%" width="124%" height="156%"');
	expect(CONTROL_GLASS_FILTER_MARKUP).toContain('color-interpolation-filters="sRGB"');
});

test("search box SVG glass filter mirrors baseline displacement-map params", () => {
	expect(SEARCH_BOX_GLASS_FILTER_MARKUP).toContain('id="mineradio-search-box-glass-filter"');
	expect(SEARCH_BOX_GLASS_FILTER_MARKUP).toContain('x="-24%" y="-34%" width="158%" height="168%"');
	expect(SEARCH_BOX_GLASS_FILTER_MARKUP).toContain('id="search-box-glass-map" x="-10%" y="-4%" width="120%" height="108%"');
	expect(SEARCH_BOX_GLASS_FILTER_MARKUP).toContain('scale="180"');
	expect(SEARCH_BOX_GLASS_FILTER_MARKUP).toContain('scale="170"');
	expect(SEARCH_BOX_GLASS_FILTER_MARKUP).toContain('scale="160"');
	expect(SEARCH_BOX_GLASS_FILTER_MARKUP).toContain('dx="-90" dy="0"');
	expect(SEARCH_BOX_GLASS_FILTER_MARKUP).toContain('stdDeviation="0.5"');
});

test("search pill SVG glass filter mirrors baseline tighter pill params", () => {
	expect(SEARCH_PILL_GLASS_FILTER_MARKUP).toContain('id="mineradio-search-pill-glass-filter"');
	expect(SEARCH_PILL_GLASS_FILTER_MARKUP).toContain('x="-48%" y="-68%" width="210%" height="236%"');
	expect(SEARCH_PILL_GLASS_FILTER_MARKUP).toContain('id="search-pill-glass-map" x="-24%" y="-14%" width="148%" height="128%"');
	expect(SEARCH_PILL_GLASS_FILTER_MARKUP).toContain('scale="118"');
	expect(SEARCH_PILL_GLASS_FILTER_MARKUP).toContain('scale="108"');
	expect(SEARCH_PILL_GLASS_FILTER_MARKUP).toContain('scale="100"');
	expect(SEARCH_PILL_GLASS_FILTER_MARKUP).toContain('dx="-34" dy="0"');
	expect(SEARCH_PILL_GLASS_FILTER_MARKUP).toContain('stdDeviation="0.35"');
});

test("control glass defs include bottom bar, search box, and search pill filters", () => {
	expect(CONTROL_GLASS_FILTER_DEFS_MARKUP.match(/<filter id=/g)?.length).toBe(3);
	expect(CONTROL_GLASS_FILTER_DEFS_MARKUP).toContain('id="mineradio-control-glass-filter"');
	expect(CONTROL_GLASS_FILTER_DEFS_MARKUP).toContain('id="mineradio-search-box-glass-filter"');
	expect(CONTROL_GLASS_FILTER_DEFS_MARKUP).toContain('id="mineradio-search-pill-glass-filter"');
});

test("createControlGlassSvg injects all baseline filter nodes", async () => {
	await import("../runtime/happy-dom-preload");
	document.body.innerHTML = "";
	const svg = createControlGlassSvg(document.body);
	expect(svg.querySelectorAll("filter").length).toBe(3);
	expect(svg.querySelector("#mineradio-control-glass-filter")).not.toBeNull();
	expect(svg.querySelector("#mineradio-search-box-glass-filter")).not.toBeNull();
	expect(svg.querySelector("#mineradio-search-pill-glass-filter")).not.toBeNull();
});

test("applyControlGlassChromaticOffset mirrors baseline dx clamp on all control feOffset nodes", async () => {
	await import("../runtime/happy-dom-preload");
	document.body.innerHTML = "";
	const svg = createControlGlassSvg(document.body);

	applyControlGlassChromaticOffset(document, 37.6);
	const offsets = Array.from(
		svg.querySelectorAll("#mineradio-control-glass-filter feOffset"),
	);
	expect(offsets.map((node) => node.getAttribute("dx"))).toEqual(["-38", "-38", "-38"]);
	expect(offsets.map((node) => node.getAttribute("dy"))).toEqual(["0", "0", "0"]);

	applyControlGlassChromaticOffset(document, 999);
	expect(offsets.map((node) => node.getAttribute("dx"))).toEqual(["-140", "-140", "-140"]);
});

// NOTE: byte-equal port of the Electron baseline SVG displacement-map glass filter
// (public/index.html line 2342-2359). User has HARD requirement to preserve the RGB
// three-channel chromatic offset — DO NOT replace with generic blur(). DO NOT enlarge
// stdDeviation. DO NOT delete the three-channel color separation.

export const CONTROL_GLASS_FILTER_MARKUP = `    <filter id="mineradio-control-glass-filter" color-interpolation-filters="sRGB" x="-12%" y="-28%" width="124%" height="156%">
      <feImage id="control-glass-map" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map"></feImage>
      <feDisplacementMap in="SourceGraphic" in2="map" scale="180" xChannelSelector="R" yChannelSelector="B" result="dispRed"></feDisplacementMap>
      <feOffset in="dispRed" dx="-90" dy="0" result="dispRedShifted"></feOffset>
      <feMerge result="dispRedAligned"><feMergeNode in="SourceGraphic"></feMergeNode><feMergeNode in="dispRedShifted"></feMergeNode></feMerge>
      <feColorMatrix in="dispRedAligned" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red"></feColorMatrix>
      <feDisplacementMap in="SourceGraphic" in2="map" scale="170" xChannelSelector="R" yChannelSelector="B" result="dispGreen"></feDisplacementMap>
      <feOffset in="dispGreen" dx="-90" dy="0" result="dispGreenShifted"></feOffset>
      <feMerge result="dispGreenAligned"><feMergeNode in="SourceGraphic"></feMergeNode><feMergeNode in="dispGreenShifted"></feMergeNode></feMerge>
      <feColorMatrix in="dispGreenAligned" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green"></feColorMatrix>
      <feDisplacementMap in="SourceGraphic" in2="map" scale="160" xChannelSelector="R" yChannelSelector="B" result="dispBlue"></feDisplacementMap>
      <feOffset in="dispBlue" dx="-90" dy="0" result="dispBlueShifted"></feOffset>
      <feMerge result="dispBlueAligned"><feMergeNode in="SourceGraphic"></feMergeNode><feMergeNode in="dispBlueShifted"></feMergeNode></feMerge>
      <feColorMatrix in="dispBlueAligned" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue"></feColorMatrix>
      <feBlend in="red" in2="green" mode="screen" result="rg"></feBlend>
      <feBlend in="rg" in2="blue" mode="screen" result="output"></feBlend>
      <feGaussianBlur in="output" stdDeviation="0.5"></feGaussianBlur>
    </filter>`;

export const SEARCH_BOX_GLASS_FILTER_MARKUP = `    <filter id="mineradio-search-box-glass-filter" color-interpolation-filters="sRGB" x="-24%" y="-34%" width="158%" height="168%">
      <feImage id="search-box-glass-map" x="-10%" y="-4%" width="120%" height="108%" preserveAspectRatio="none" result="map"></feImage>
      <feDisplacementMap in="SourceGraphic" in2="map" scale="180" xChannelSelector="R" yChannelSelector="B" result="dispRed"></feDisplacementMap>
      <feOffset in="dispRed" dx="-90" dy="0" result="dispRedShifted"></feOffset>
      <feMerge result="dispRedAligned"><feMergeNode in="SourceGraphic"></feMergeNode><feMergeNode in="dispRedShifted"></feMergeNode></feMerge>
      <feColorMatrix in="dispRedAligned" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red"></feColorMatrix>
      <feDisplacementMap in="SourceGraphic" in2="map" scale="170" xChannelSelector="R" yChannelSelector="B" result="dispGreen"></feDisplacementMap>
      <feOffset in="dispGreen" dx="-90" dy="0" result="dispGreenShifted"></feOffset>
      <feMerge result="dispGreenAligned"><feMergeNode in="SourceGraphic"></feMergeNode><feMergeNode in="dispGreenShifted"></feMergeNode></feMerge>
      <feColorMatrix in="dispGreenAligned" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green"></feColorMatrix>
      <feDisplacementMap in="SourceGraphic" in2="map" scale="160" xChannelSelector="R" yChannelSelector="B" result="dispBlue"></feDisplacementMap>
      <feOffset in="dispBlue" dx="-90" dy="0" result="dispBlueShifted"></feOffset>
      <feMerge result="dispBlueAligned"><feMergeNode in="SourceGraphic"></feMergeNode><feMergeNode in="dispBlueShifted"></feMergeNode></feMerge>
      <feColorMatrix in="dispBlueAligned" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue"></feColorMatrix>
      <feBlend in="red" in2="green" mode="screen" result="rg"></feBlend>
      <feBlend in="rg" in2="blue" mode="screen" result="output"></feBlend>
      <feGaussianBlur in="output" stdDeviation="0.5"></feGaussianBlur>
    </filter>`;

export const SEARCH_PILL_GLASS_FILTER_MARKUP = `    <filter id="mineradio-search-pill-glass-filter" color-interpolation-filters="sRGB" x="-48%" y="-68%" width="210%" height="236%">
      <feImage id="search-pill-glass-map" x="-24%" y="-14%" width="148%" height="128%" preserveAspectRatio="none" result="map"></feImage>
      <feDisplacementMap in="SourceGraphic" in2="map" scale="118" xChannelSelector="R" yChannelSelector="B" result="dispRed"></feDisplacementMap>
      <feOffset in="dispRed" dx="-34" dy="0" result="dispRedShifted"></feOffset>
      <feMerge result="dispRedAligned"><feMergeNode in="SourceGraphic"></feMergeNode><feMergeNode in="dispRedShifted"></feMergeNode></feMerge>
      <feColorMatrix in="dispRedAligned" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red"></feColorMatrix>
      <feDisplacementMap in="SourceGraphic" in2="map" scale="108" xChannelSelector="R" yChannelSelector="B" result="dispGreen"></feDisplacementMap>
      <feOffset in="dispGreen" dx="-34" dy="0" result="dispGreenShifted"></feOffset>
      <feMerge result="dispGreenAligned"><feMergeNode in="SourceGraphic"></feMergeNode><feMergeNode in="dispGreenShifted"></feMergeNode></feMerge>
      <feColorMatrix in="dispGreenAligned" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green"></feColorMatrix>
      <feDisplacementMap in="SourceGraphic" in2="map" scale="100" xChannelSelector="R" yChannelSelector="B" result="dispBlue"></feDisplacementMap>
      <feOffset in="dispBlue" dx="-34" dy="0" result="dispBlueShifted"></feOffset>
      <feMerge result="dispBlueAligned"><feMergeNode in="SourceGraphic"></feMergeNode><feMergeNode in="dispBlueShifted"></feMergeNode></feMerge>
      <feColorMatrix in="dispBlueAligned" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue"></feColorMatrix>
      <feBlend in="red" in2="green" mode="screen" result="rg"></feBlend>
      <feBlend in="rg" in2="blue" mode="screen" result="output"></feBlend>
      <feGaussianBlur in="output" stdDeviation="0.35"></feGaussianBlur>
    </filter>`;

export const CONTROL_GLASS_FILTER_DEFS_MARKUP = [
	CONTROL_GLASS_FILTER_MARKUP,
	SEARCH_BOX_GLASS_FILTER_MARKUP,
	SEARCH_PILL_GLASS_FILTER_MARKUP,
].join("\n");

const SVG_NS = "http://www.w3.org/2000/svg";
export const CONTROL_GLASS_SVG_ID = "control-glass-svg";

export function generateControlGlassDisplacementMap(width: number, height: number, radius: number): string {
	const w = Math.max(240, Math.round(width || 400));
	const h = Math.max(48, Math.round(height || 92));
	const r = Math.max(12, Math.round(radius || 50));
	const borderWidth = 0.07;
	const edge = Math.min(w, h) * (borderWidth * 0.5);
	const innerW = Math.max(1, w - edge * 2);
	const innerH = Math.max(1, h - edge * 2);
	const svg =
		'<svg viewBox="0 0 ' + w + " " + h + '" xmlns="http://www.w3.org/2000/svg">' +
		"<defs>" +
		'<linearGradient id="glass-red" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/></linearGradient>' +
		'<linearGradient id="glass-blue" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/></linearGradient>' +
		"</defs>" +
		'<rect x="0" y="0" width="' + w + '" height="' + h + '" fill="black"/>' +
		'<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="' + r + '" fill="url(#glass-red)"/>' +
		'<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="' + r + '" fill="url(#glass-blue)" style="mix-blend-mode:difference"/>' +
		'<rect x="' + edge.toFixed(2) + '" y="' + edge.toFixed(2) + '" width="' + innerW.toFixed(2) + '" height="' + innerH.toFixed(2) + '" rx="' + r + '" fill="hsl(0 0% 50% / 1)" style="filter:blur(11px)"/>' +
		"</svg>";
	return "data:image/svg+xml," + encodeURIComponent(svg);
}

export function supportsControlGlassSvgFilter(): boolean {
	if (typeof navigator === "undefined" || typeof document === "undefined") return false;
	try {
		const ua = navigator.userAgent || "";
		if (/Safari/.test(ua) && !/Chrome/.test(ua)) return false;
		if (/Firefox/.test(ua)) return false;
		const probe = document.createElement("div");
		probe.style.backdropFilter = "url(#mineradio-control-glass-filter)";
		return probe.style.backdropFilter !== "";
	} catch {
		return false;
	}
}

export function createControlGlassSvg(root: SVGElement | HTMLElement | null): SVGElement {
	if (typeof document === "undefined") {
		throw new Error("createControlGlassSvg requires a DOM document");
	}
	const svg = document.createElementNS(SVG_NS, "svg") as SVGElement;
	svg.setAttribute("id", CONTROL_GLASS_SVG_ID);
	svg.setAttribute("class", "control-glass-filter-svg");
	svg.setAttribute("aria-hidden", "true");
	svg.setAttribute("focusable", "false");
	const defs = document.createElementNS(SVG_NS, "defs");
	const template = `<svg xmlns="${SVG_NS}">${CONTROL_GLASS_FILTER_DEFS_MARKUP}</svg>`;
	if (typeof DOMParser !== "undefined") {
		const parsed = new DOMParser().parseFromString(template, "image/svg+xml");
		const topError = parsed.querySelector("parsererror");
		const filterEls = topError ? [] : Array.from(parsed.documentElement.children);
		if (filterEls.length) {
			for (const filterEl of filterEls) {
				defs.appendChild(document.importNode(filterEl, true));
			}
		} else {
			defs.innerHTML = CONTROL_GLASS_FILTER_DEFS_MARKUP;
		}
	} else {
		defs.innerHTML = CONTROL_GLASS_FILTER_DEFS_MARKUP;
	}
	svg.appendChild(defs);
	if (root && "appendChild" in root) {
		(root as HTMLElement).appendChild(svg);
	}
	return svg;
}

export function normalizeControlGlassChromaticOffset(value: unknown): number {
	const n = typeof value === "number" ? value : Number(value);
	const finite = Number.isFinite(n) ? n : 90;
	return Math.max(0, Math.min(140, finite));
}

export function applyControlGlassChromaticOffset(
	root: Document | Element | null | undefined,
	value: unknown,
): number {
	const offset = normalizeControlGlassChromaticOffset(value);
	const filter = root?.querySelector?.("#mineradio-control-glass-filter");
	if (!filter) return offset;
	const dx = String(-Math.round(offset));
	filter.querySelectorAll("feOffset").forEach((node) => {
		node.setAttribute("dx", dx);
		node.setAttribute("dy", "0");
	});
	return offset;
}

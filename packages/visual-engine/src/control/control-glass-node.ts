// NOTE: appends the SVG displacement-map glass filter <svg> and toggles the
// html.control-glass-svg-ok class. ResizeObserver refreshes the displacement map inputs
// as the bar width/height change. If attachment fails (SSR/test without ResizeObserver),
// no-op but DO NOT change the look — note the error.

import { createControlGlassSvg, generateControlGlassDisplacementMap, supportsControlGlassSvgFilter } from "./control-glass-svg";

export interface ControlGlassNodeOptions {
	refreshOnResize?: boolean;
}

const XLINK_NS = "http://www.w3.org/1999/xlink";

function setMapHref(mapImg: SVGFEImageElement, href: string): void {
	mapImg.setAttribute("href", href);
	try {
		mapImg.setAttributeNS(XLINK_NS, "href", href);
	} catch {
		// ignore — some legacy browsers reject xlink href on SVGFEImageElement
	}
}

function updateMapForRect(width: number, height: number, radius: number, mapImg: SVGFEImageElement): void {
	const href = generateControlGlassDisplacementMap(width, height, radius);
	setMapHref(mapImg, href);
}

function updateMap(barEl: HTMLElement, mapImg: SVGFEImageElement): void {
	if (!barEl || !mapImg) return;
	const rect = barEl.getBoundingClientRect();
	if (rect.width < 2 || rect.height < 2) return;
	const radius = parseFloat(getComputedStyle(barEl).borderRadius) || 24;
	updateMapForRect(rect.width, rect.height, radius, mapImg);
}

function updateSearchPillMap(mapImg: SVGFEImageElement): void {
	const nodes = Array.from(
		document.querySelectorAll<HTMLElement>(".search-mode-tabs button,.search-history-chip"),
	);
	if (!nodes.length) return;
	let maxW = 0;
	let maxH = 0;
	let maxRadius = 14;
	for (const el of nodes) {
		if (el.offsetParent === null) continue;
		const rect = el.getBoundingClientRect();
		if (rect.width < 2 || rect.height < 2) continue;
		maxW = Math.max(maxW, rect.width);
		maxH = Math.max(maxH, rect.height);
		maxRadius = Math.max(
			maxRadius,
			parseFloat(getComputedStyle(el).borderRadius) || Math.round(rect.height / 2) || 14,
		);
	}
	if (maxW < 2 || maxH < 2) return;
	const width = Math.max(96, Math.round(maxW));
	const height = Math.max(32, Math.round(maxH));
	const radius = Math.max(12, Math.min(Math.round(maxRadius), Math.round(height / 2) + 10));
	updateMapForRect(width, height, radius, mapImg);
}

export function attachControlGlassNode(barEl: HTMLElement | null, optsGlass: ControlGlassNodeOptions = {}): () => void {
	if (typeof document === "undefined" || !barEl) {
		return () => {};
	}
	if (typeof ResizeObserver === "undefined") {
		return () => {};
	}

	let svg = document.getElementById("control-glass-svg") as SVGElement | null;
	if (!svg) {
		try {
			svg = createControlGlassSvg(document.body);
		} catch {
			return () => {};
		}
	}

	if (supportsControlGlassSvgFilter()) {
		document.documentElement.classList.add("control-glass-svg-ok");
	}

	let ro: ResizeObserver | null = null;
	const refresh = () => {
		const controlMap = document.getElementById("control-glass-map") as SVGFEImageElement | null;
		const searchBoxMap = document.getElementById("search-box-glass-map") as SVGFEImageElement | null;
		const searchPillMap = document.getElementById("search-pill-glass-map") as SVGFEImageElement | null;
		const searchBox = document.getElementById("search-box") as HTMLElement | null;
		if (controlMap) updateMap(barEl, controlMap);
		if (searchBox && searchBoxMap) updateMap(searchBox, searchBoxMap);
		if (searchPillMap) updateSearchPillMap(searchPillMap);
	};
	refresh();
	if (optsGlass.refreshOnResize !== false) {
		ro = new ResizeObserver(() => {
			if (typeof requestAnimationFrame === "function") requestAnimationFrame(refresh);
			else refresh();
		});
		ro.observe(barEl);
		const searchBox = document.getElementById("search-box");
		const searchTabs = document.getElementById("search-mode-tabs");
		const searchResults = document.getElementById("search-results");
		if (searchBox) ro.observe(searchBox);
		if (searchTabs) ro.observe(searchTabs);
		if (searchResults) ro.observe(searchResults);
	}

	let mutationObserver: MutationObserver | null = null;
	if (typeof MutationObserver !== "undefined") {
		const searchTabs = document.getElementById("search-mode-tabs");
		const searchResults = document.getElementById("search-results");
		if (searchTabs || searchResults) {
			mutationObserver = new MutationObserver(() => {
				if (typeof requestAnimationFrame === "function") requestAnimationFrame(refresh);
				else refresh();
			});
			if (searchTabs) {
				mutationObserver.observe(searchTabs, {
					childList: true,
					subtree: true,
					attributes: true,
					attributeFilter: ["class"],
				});
			}
			if (searchResults) mutationObserver.observe(searchResults, { childList: true, subtree: true });
		}
	}

	let resizeListener: (() => void) | null = null;
	if (typeof window !== "undefined") {
		resizeListener = () => {
			if (typeof requestAnimationFrame === "function") requestAnimationFrame(refresh);
			else refresh();
		};
		window.addEventListener("resize", resizeListener);
	}

	return () => {
		if (ro) ro.disconnect();
		ro = null;
		if (mutationObserver) mutationObserver.disconnect();
		mutationObserver = null;
		if (resizeListener && typeof window !== "undefined") {
			window.removeEventListener("resize", resizeListener);
			resizeListener = null;
		}
	};
}

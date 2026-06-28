import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { App, isHomeBlankDismissElement } from "./App";

test("App keeps the empty-home music page mounted behind the splash gate", () => {
	const html = renderToStaticMarkup(React.createElement(App));
	expect(html).toContain('class="visual-splash-root"');
	expect(html).toContain('id="visual-host"');
	expect(html).toContain('id="empty-home"');
	expect(html).toContain('id="search-area"');
	expect(html).toContain('id="top-right"');
	expect(html).toContain('id="bottom-handle"');
	expect(html).toContain('id="bottom-bar"');
	expect(html).toContain('id="user-btn"');
	expect(html).toContain("🚧此处施工，敬请期待🚧");
	expect(html).toContain("展开播放器控制台");
	expect(html).toContain("每日推荐");
});

test("Home blank dismiss accepts only empty Home surfaces", async () => {
	await import("../../../../packages/visual-engine/src/runtime/happy-dom-preload");
	document.body.innerHTML = `
		<section id="empty-home">
			<div class="empty-home-shell" id="blank"></div>
			<button class="home-card" id="card">card</button>
			<input id="search-input" />
			<div id="bottom-handle"></div>
		</section>
	`;
	expect(isHomeBlankDismissElement(document.getElementById("blank"))).toBe(true);
	expect(isHomeBlankDismissElement(document.getElementById("card"))).toBe(false);
	expect(isHomeBlankDismissElement(document.getElementById("search-input"))).toBe(false);
	expect(isHomeBlankDismissElement(document.getElementById("bottom-handle"))).toBe(false);
});

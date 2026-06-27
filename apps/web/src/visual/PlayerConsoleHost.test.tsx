import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { PlayerConsoleHost } from "./PlayerConsoleHost";

test("PlayerConsoleHost server-renders the bottom-bar markup", () => {
	const html = renderToStaticMarkup(React.createElement(PlayerConsoleHost, {}));
	expect(html).toContain('id="bottom-bar"');
	expect(html).toContain('id="play-btn"');
	expect(html).toContain('id="play-mode-btn"');
	expect(html).toContain('id="control-cover"');
	expect(html).toContain('id="time-display"');
});

test("PlayerConsoleHost renders window chrome stub buttons that accept callbacks without throwing", () => {
	let mini = 0;
	let max = 0;
	let fs = 0;
	let close = 0;
	const html = renderToStaticMarkup(
		React.createElement(PlayerConsoleHost, {
			onMinimize: () => { mini += 1; },
			onToggleMaximize: () => { max += 1; },
			onToggleFullscreen: () => { fs += 1; },
			onClose: () => { close += 1; },
		}),
	);
	expect(html).toContain("console-host-minimize");
	expect(html).toContain("console-host-maximize");
	expect(html).toContain("console-host-close");
	void mini; void max; void fs; void close;
});
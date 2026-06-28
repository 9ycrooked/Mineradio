import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import {
	resolveVisualCoverUrl,
	resolveRuntimeShelfMode,
	syncRuntimeShelfModeOverride,
	VisualEngineHost,
} from "./VisualEngineHost";

test("VisualEngineHost server-renders a visual-host placeholder div without invoking WebGL/AudioContext", () => {
	const html = renderToStaticMarkup(
		React.createElement(VisualEngineHost, {
			audioElementRef: { current: null },
			controllerRef: { current: null },
			lyricsPayload: null,
			positionMs: 0,
			isPlaying: false,
		}),
	);
	expect(html).toContain('id="visual-host"');
	expect(html).not.toContain("canvas");
});

test("resolveRuntimeShelfMode keeps runtime side promotion across default off rerenders", () => {
	expect(resolveRuntimeShelfMode("off", "side")).toBe("side");
	expect(resolveRuntimeShelfMode("off", null)).toBe("off");
	expect(resolveRuntimeShelfMode(undefined, "side")).toBe("side");
});

test("syncRuntimeShelfModeOverride clears runtime override when default shelf prop changes", () => {
	const previousDefaultRef = { current: "off" as string | undefined };
	const overrideRef = { current: "side" as string | null };
	syncRuntimeShelfModeOverride(previousDefaultRef, overrideRef, "off");
	expect(overrideRef.current).toBe("side");
	syncRuntimeShelfModeOverride(previousDefaultRef, overrideRef, "stage");
	expect(overrideRef.current).toBeNull();
	expect(previousDefaultRef.current).toBe("stage");
});

test("resolveVisualCoverUrl prefers explicit currentCoverUrl and falls back to currentTrack.coverUrl", () => {
	expect(resolveVisualCoverUrl("override.jpg", { coverUrl: "track.jpg" } as never)).toBe("override.jpg");
	expect(resolveVisualCoverUrl(undefined, { coverUrl: "track.jpg" } as never)).toBe("track.jpg");
	expect(resolveVisualCoverUrl(null, null)).toBe("");
});

import { expect, test } from "bun:test";
import { exportJsonFile, getRuntimeConfig, getSidecarStatus, importJsonFile, isTauriRuntime } from "./runtime";

test("isTauriRuntime is false outside the Tauri webview", () => {
	expect(isTauriRuntime()).toBe(false);
});

test("getRuntimeConfig resolves to a non-crashing placeholder outside Tauri", async () => {
	const cfg = await getRuntimeConfig();
	expect(typeof cfg.sidecarBaseUrl).toBe("string");
	expect(cfg.sidecarBaseUrl).toBe("");
	expect(typeof cfg.appVersion).toBe("string");
	expect(cfg.appVersion.length).toBeGreaterThan(0);
});

test("getSidecarStatus resolves to a non-crashing placeholder outside Tauri", async () => {
	const status = await getSidecarStatus();
	expect(status).toEqual({
		phase: "stopped",
		baseUrl: "",
		pid: null,
		restarts: 0,
		lastError: null,
		lastHealthOkMs: null,
		providers: [],
		logPath: "",
	});
});

test("JSON file helpers return cancelled placeholders outside Tauri", async () => {
	const exported = await exportJsonFile("preset.json", { enabled: true });
	expect(exported).toEqual({
		cancelled: true,
		path: null,
	});
	const imported = await importJsonFile();
	expect(imported).toEqual({
		cancelled: true,
		path: null,
		data: null,
	});
});

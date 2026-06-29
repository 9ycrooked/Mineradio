import { describe, expect, test } from "bun:test";

import {
  evaluateTauriStackPolicy,
  checkTauriStackPolicy
} from "./check-tauri-stack-policy.mjs";

describe("Tauri stack policy check", () => {
  test("rejects a root manifest that still exposes Electron as the product entry", () => {
    const result = evaluateTauriStackPolicy({
      rootPackage: {
        name: "mineradio",
        productName: "Mineradio",
        main: "desktop/main.js",
        scripts: {
          start: "electron .",
          "build:win": "electron-builder --win nsis"
        },
        build: {
          appId: "com.mineradio.desktop",
          publish: [{ provider: "github", owner: "XxHuberrr", repo: "Mineradio" }]
        },
        mineradio: {
          update: { owner: "XxHuberrr", repo: "Mineradio" }
        },
        devDependencies: {
          electron: "^42.4.1",
          "electron-builder": "^26.15.3"
        }
      }
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("root package.json must not expose desktop/main.js as the app entry");
    expect(result.errors).toContain("root package.json scripts.start must run the Tauri dev entry");
    expect(result.errors).toContain("root package.json must not keep electron-builder build config in the Tauri mainline manifest");
    expect(result.errors).toContain("root package.json must not keep legacy Electron updater metadata");
    expect(result.errors).toContain("root package.json devDependencies must not include electron");
  });

  test("accepts a root manifest whose default commands route to the Tauri/Bun workspace", () => {
    const result = evaluateTauriStackPolicy({
      rootPackage: {
        name: "mineradio",
        productName: "Mineradio Tauri Rewrite",
        private: true,
        workspaces: ["apps/*", "packages/*", "sidecars/*"],
        scripts: {
          start: "bun run tauri:dev",
          dev: "bun run tauri:dev",
          build: "bun run tauri:build",
          "tauri:dev": "bun run --filter ./apps/desktop tauri dev",
          "tauri:build": "bun run --filter ./apps/desktop tauri build",
          "web:build": "bun run --filter ./apps/web build",
          "sidecar:dev": "bun run --filter ./sidecars/api dev"
        },
        dependencies: {},
        devDependencies: {}
      },
      sidecarPackage: {
        dependencies: {
          "hana-music-api": "^1.1.1",
          "NeteaseCloudMusicApi": "^4.32.0",
          "qq-music-api": "^1.1.2"
        }
      }
    });

    expect(result).toEqual({ ok: true, errors: [] });
  });

  test("requires sidecar-owned provider dependencies that are imported by sidecar services", () => {
    const result = evaluateTauriStackPolicy({
      rootPackage: {
        productName: "Mineradio Tauri Rewrite",
        private: true,
        workspaces: ["apps/*", "packages/*", "sidecars/*"],
        scripts: {
          start: "bun run tauri:dev",
          dev: "bun run tauri:dev",
          build: "bun run tauri:build",
          "tauri:dev": "bun run --filter ./apps/desktop tauri dev",
          "tauri:build": "bun run --filter ./apps/desktop tauri build",
          "web:build": "bun run --filter ./apps/web build",
          "sidecar:dev": "bun run --filter ./sidecars/api dev"
        }
      },
      sidecarPackage: {
        dependencies: {
          "hana-music-api": "^1.1.1",
          "qq-music-api": "^1.1.2"
        }
      }
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("sidecars/api/package.json dependencies must include NeteaseCloudMusicApi because sidecar services import it");
  });

  test("current repository root manifest is Tauri mainline only", () => {
    const result = checkTauriStackPolicy(process.cwd());

    expect(result).toEqual({ ok: true, errors: [] });
  });
});

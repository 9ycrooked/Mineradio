import { describe, expect, test } from "bun:test";

import {
  buildTauriUpdaterManifest,
  evaluateUpdaterManifestPolicy,
  updaterArtifactUrl
} from "./generate-updater-manifest.mjs";

describe("Tauri updater manifest generator", () => {
  test("builds a Tauri static manifest for NSIS and fallback Windows updater targets", () => {
    const manifest = buildTauriUpdaterManifest({
      version: "0.2.0",
      notes: "Detection-only smoke release",
      pubDate: "2026-06-29T00:00:00Z",
      artifactName: "Mineradio Tauri Rewrite_0.2.0_x64-setup.exe",
      signature: "",
      repo: "zzstar101/Mineradio"
    });

    expect(manifest).toEqual({
      version: "0.2.0",
      notes: "Detection-only smoke release",
      pub_date: "2026-06-29T00:00:00Z",
      platforms: {
        "windows-x86_64-nsis": {
          signature: "",
          url: "https://github.com/zzstar101/Mineradio/releases/latest/download/Mineradio%20Tauri%20Rewrite_0.2.0_x64-setup.exe"
        },
        "windows-x86_64": {
          signature: "",
          url: "https://github.com/zzstar101/Mineradio/releases/latest/download/Mineradio%20Tauri%20Rewrite_0.2.0_x64-setup.exe"
        }
      },
      "x-mineradio-policy": {
        updater: "detection-only",
        reason: "tauri-updater-signature-key-missing"
      }
    });
  });

  test("encodes GitHub release asset URLs without changing the locked updater repo", () => {
    expect(updaterArtifactUrl({
      repo: "zzstar101/Mineradio",
      artifactName: "Mineradio Tauri Rewrite_0.1.0_x64-setup.exe"
    })).toBe("https://github.com/zzstar101/Mineradio/releases/latest/download/Mineradio%20Tauri%20Rewrite_0.1.0_x64-setup.exe");
  });

  test("rejects manifests that drift from the detection-only unsigned updater policy", () => {
    const result = evaluateUpdaterManifestPolicy({
      manifest: {
        version: "0.2.0",
        platforms: {
          "windows-x86_64-msi": {
            url: "https://github.com/XxHuberrr/Mineradio/releases/latest/download/app.exe",
            signature: "signed"
          }
        }
      },
      pubkey: ""
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("updater manifest must include windows-x86_64-nsis");
    expect(result.errors).toContain("updater manifest must include windows-x86_64 fallback");
    expect(result.errors).toContain("updater manifest URLs must stay on zzstar101/Mineradio");
    expect(result.errors).toContain("unsigned detection-only manifests must keep platform signatures empty");
    expect(result.errors).toContain("unsigned detection-only manifests must carry x-mineradio-policy.updater=detection-only");
  });
});

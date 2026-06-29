import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  buildTauriUpdaterManifest,
  evaluateUpdaterManifestPolicy,
  generateUpdaterManifestFromWorkspace,
  updaterArtifactUrl
} from "./generate-updater-manifest.mjs";

const tempRoots = [];

function makeManifestWorkspace() {
  const root = mkdtempSync(join(tmpdir(), "mineradio-updater-manifest-"));
  tempRoots.push(root);
  mkdirSync(join(root, "apps/desktop/src-tauri"), { recursive: true });
  writeFileSync(join(root, "apps/desktop/package.json"), JSON.stringify({
    version: "0.2.0"
  }), "utf8");
  writeFileSync(join(root, "apps/desktop/src-tauri/tauri.conf.json"), JSON.stringify({
    productName: "Mineradio Tauri Rewrite"
  }), "utf8");
  return root;
}

afterEach(() => {
  while (tempRoots.length > 0) {
    rmSync(tempRoots.pop(), { recursive: true, force: true });
  }
});

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

  test("uses signed default notes when generating a signed workspace manifest", () => {
    const manifest = generateUpdaterManifestFromWorkspace(makeManifestWorkspace(), {
      signature: "minisignature"
    });

    expect(manifest.notes.toLowerCase()).toContain("signed update manifest");
    expect(manifest.notes.toLowerCase()).not.toContain("detection-only");
    expect(manifest["x-mineradio-policy"]).toEqual({
      updater: "signed",
      reason: "tauri-updater-signature-present"
    });
  });

  test("keeps detection-only default notes for unsigned workspace manifests", () => {
    const manifest = generateUpdaterManifestFromWorkspace(makeManifestWorkspace());

    expect(manifest.notes.toLowerCase()).toContain("detection-only update manifest");
    expect(manifest["x-mineradio-policy"]).toEqual({
      updater: "detection-only",
      reason: "tauri-updater-signature-key-missing"
    });
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

  test("signed manifests require non-empty signatures when pubkey is configured", () => {
    const missing = evaluateUpdaterManifestPolicy({
      manifest: buildTauriUpdaterManifest({
        version: "0.2.0",
        artifactName: "Mineradio Tauri Rewrite_0.2.0_x64-setup.exe",
        signature: "",
        repo: "zzstar101/Mineradio"
      }),
      pubkey: "public-key"
    });

    expect(missing.ok).toBe(false);
    expect(missing.errors).toContain("signed updater manifests must include non-empty platform signatures");

    const signed = evaluateUpdaterManifestPolicy({
      manifest: buildTauriUpdaterManifest({
        version: "0.2.0",
        artifactName: "Mineradio Tauri Rewrite_0.2.0_x64-setup.exe",
        signature: "minisignature",
        repo: "zzstar101/Mineradio"
      }),
      pubkey: "public-key"
    });

    expect(signed).toEqual({ ok: true, errors: [] });
  });
});

import { describe, expect, test } from "bun:test";

import {
  evaluateReleaseCspPolicy,
  extractReleaseCspPolicy,
  parseCspDirectives
} from "./check-release-csp.mjs";

function validDevCsp() {
  return [
    "default-src 'self' http://127.0.0.1:5173",
    "script-src 'self' http://127.0.0.1:5173 'unsafe-eval' 'wasm-unsafe-eval' https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2 https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/",
    "style-src 'self' http://127.0.0.1:5173 'unsafe-inline'",
    "img-src 'self' data: blob: http://127.0.0.1:*",
    "media-src 'self' blob: http://127.0.0.1:*",
    "connect-src 'self' http://127.0.0.1:* ws://127.0.0.1:5173 https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/ https://huggingface.co/Xenova/depth-anything-small-hf/ https://huggingface.co/api/resolve-cache/models/Xenova/depth-anything-small-hf/ https://us.aws.cdn.hf.co/xet-bridge-us/65b10f1dc9a5a7680fa72994/",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'"
  ].join("; ");
}

describe("release CSP policy check", () => {
  test("parses CSP directives into source lists", () => {
    const directives = parseCspDirectives("default-src 'self'; connect-src 'self' http://127.0.0.1:*; img-src 'self' data: blob:");

    expect(directives.get("default-src")).toEqual(["'self'"]);
    expect(directives.get("connect-src")).toEqual(["'self'", "http://127.0.0.1:*"]);
    expect(directives.get("img-src")).toEqual(["'self'", "data:", "blob:"]);
  });

  test("extracts the configured Tauri app CSP", () => {
    const policy = extractReleaseCspPolicy({
      app: {
        security: {
          csp: "default-src 'self'; object-src 'none';",
          devCsp: "default-src 'self' http://127.0.0.1:5173"
        }
      }
    });

    expect(policy.csp).toBe("default-src 'self'; object-src 'none';");
    expect(policy.devCsp).toBe("default-src 'self' http://127.0.0.1:5173");
  });

  test("fails when release CSP remains unset or too loose", () => {
    const result = evaluateReleaseCspPolicy({ csp: null });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("app.security.csp must be a non-empty release CSP string");
  });

  test("requires sidecar allowances plus reviewed AI depth model origins and blocks unsafe sources", () => {
    const result = evaluateReleaseCspPolicy({
      csp: [
        "default-src 'self'",
        "script-src 'self' 'wasm-unsafe-eval' https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2 https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/",
        "style-src 'self'",
        "img-src 'self' data: blob: http://127.0.0.1:*",
        "media-src 'self' http://127.0.0.1:* blob:",
        "connect-src 'self' http://127.0.0.1:* https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/ https://huggingface.co/Xenova/depth-anything-small-hf/ https://huggingface.co/api/resolve-cache/models/Xenova/depth-anything-small-hf/ https://us.aws.cdn.hf.co/xet-bridge-us/65b10f1dc9a5a7680fa72994/",
        "worker-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'none'",
        "frame-ancestors 'none'"
      ].join("; "),
      devCsp: validDevCsp()
    });

    expect(result).toEqual({ ok: true, errors: [] });
  });

  test("rejects broad CDN or HuggingFace origins outside the reviewed AI depth paths", () => {
    const result = evaluateReleaseCspPolicy({
      csp: [
        "default-src 'self'",
        "script-src 'self' 'wasm-unsafe-eval' https://cdn.jsdelivr.net",
        "style-src 'self'",
        "img-src 'self' data: blob: http://127.0.0.1:*",
        "media-src 'self' http://127.0.0.1:* blob:",
        "connect-src 'self' http://127.0.0.1:* https://huggingface.co https://*.huggingface.co",
        "worker-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'none'",
        "frame-ancestors 'none'"
      ].join("; "),
      devCsp: validDevCsp()
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("CSP script-src must include https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2");
    expect(result.errors).toContain("CSP connect-src must include https://huggingface.co/Xenova/depth-anything-small-hf/");
    expect(result.errors).toContain("CSP script-src must not allow external source https://cdn.jsdelivr.net; use the sidecar proxy or the reviewed AI depth model sources");
    expect(result.errors).toContain("CSP connect-src must not allow external source https://huggingface.co; use the sidecar proxy or the reviewed AI depth model sources");
    expect(result.errors).toContain("CSP connect-src must not allow external source https://*.huggingface.co; use the sidecar proxy or the reviewed AI depth model sources");
  });

  test("requires the Tauri dev CSP to keep the reviewed AI depth remote model reachable", () => {
    const result = evaluateReleaseCspPolicy({
      csp: [
        "default-src 'self'",
        "script-src 'self' 'wasm-unsafe-eval' https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2 https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/",
        "style-src 'self'",
        "img-src 'self' data: blob: http://127.0.0.1:*",
        "media-src 'self' http://127.0.0.1:* blob:",
        "connect-src 'self' http://127.0.0.1:* https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/ https://huggingface.co/Xenova/depth-anything-small-hf/ https://huggingface.co/api/resolve-cache/models/Xenova/depth-anything-small-hf/ https://us.aws.cdn.hf.co/xet-bridge-us/65b10f1dc9a5a7680fa72994/",
        "worker-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'none'",
        "frame-ancestors 'none'"
      ].join("; "),
      devCsp: [
        "default-src 'self' http://127.0.0.1:5173",
        "script-src 'self' http://127.0.0.1:5173 'unsafe-eval'",
        "style-src 'self' http://127.0.0.1:5173 'unsafe-inline'",
        "img-src 'self' data: blob: http://127.0.0.1:*",
        "media-src 'self' blob: http://127.0.0.1:*",
        "connect-src 'self' http://127.0.0.1:* ws://127.0.0.1:5173",
        "worker-src 'self'",
        "object-src 'none'",
        "base-uri 'none'",
        "frame-ancestors 'none'"
      ].join("; ")
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("devCsp script-src must include 'wasm-unsafe-eval'");
    expect(result.errors).toContain("devCsp script-src must include https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2");
    expect(result.errors).toContain("devCsp connect-src must include https://huggingface.co/Xenova/depth-anything-small-hf/");
    expect(result.errors).toContain("devCsp worker-src must include blob:");
  });
});

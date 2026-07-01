import { expect, test } from "bun:test";
import "../../../../packages/visual-engine/src/runtime/happy-dom-preload";
import { FX_DEFAULTS } from "@mineradio/visual-engine";
import { applyVisualThemeToRoot } from "./visual-theme";

test("applyVisualThemeToRoot mirrors baseline UI, Home, and visual tint CSS variables", () => {
  const root = document.createElement("div");
  applyVisualThemeToRoot(root, {
    ...FX_DEFAULTS,
    uiAccentColor: "#12abef",
    homeAccentColor: "#fedcba",
    visualTintColor: "#223344",
  });

  expect(root.style.getPropertyValue("--fc-accent")).toBe("#12abef");
  expect(root.style.getPropertyValue("--fc-accent-hov")).toBe("#12abef");
  expect(root.style.getPropertyValue("--fc-accent-rgb")).toBe("18,171,239");
  expect(root.style.getPropertyValue("--home-accent")).toBe("#fedcba");
  expect(root.style.getPropertyValue("--home-accent-rgb")).toBe("254,220,186");
  expect(root.style.getPropertyValue("--glass-border")).toBe("rgba(18,171,239,.30)");
  expect(root.style.getPropertyValue("--visual-tint")).toBe("#223344");
});

test("applyVisualThemeToRoot applies baseline custom background opacity classes and variables", () => {
  document.body.className = "";
  applyVisualThemeToRoot(document.documentElement, {
    ...FX_DEFAULTS,
    backgroundOpacity: 0.42,
  });

  expect(document.documentElement.style.getPropertyValue("--custom-bg-color")).toBe("#000000");
  expect(document.body.classList.contains("custom-background-override")).toBe(true);
  expect(document.body.classList.contains("custom-background-flat")).toBe(true);

  applyVisualThemeToRoot(document.documentElement, {
    ...FX_DEFAULTS,
    backgroundOpacity: 1,
  });
  expect(document.body.classList.contains("custom-background-override")).toBe(false);
  expect(document.body.classList.contains("custom-background-flat")).toBe(false);
});

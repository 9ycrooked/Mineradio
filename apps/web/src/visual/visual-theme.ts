import { applyControlGlassChromaticOffset, type FxState } from "@mineradio/visual-engine";

export function applyVisualThemeToRoot(
  root: HTMLElement,
  fx: Pick<
    FxState,
    | "uiAccentColor"
    | "visualTintColor"
    | "homeAccentColor"
    | "backgroundColor"
    | "backgroundColorMode"
    | "backgroundOpacity"
    | "backgroundColorCustom"
    | "controlGlassChromaticOffset"
  >,
): void {
  const accent = normalizeHexColor(fx.uiAccentColor, "#ffffff");
  const tint = normalizeHexColor(fx.visualTintColor, "#9db8cf");
  const homeAccent = normalizeHexColor(fx.homeAccentColor, "#ffffff");
  const backgroundColor = normalizeHexColor(fx.backgroundColor, "#000000");
  const backgroundOpacity = clamp01(fx.backgroundOpacity);
  const customBackground =
    fx.backgroundColorMode === "custom" || fx.backgroundColorCustom === true;
  const customBackgroundOverride = customBackground || backgroundOpacity < 1;
  const rgb = hexToRgb(accent);
  const homeRgb = hexToRgb(homeAccent);
  root.style.setProperty("--fc-accent", accent);
  root.style.setProperty("--fc-accent-hov", accent);
  root.style.setProperty("--fc-accent-rgb", `${rgb.r},${rgb.g},${rgb.b}`);
  root.style.setProperty("--home-accent", homeAccent);
  root.style.setProperty("--home-accent-rgb", `${homeRgb.r},${homeRgb.g},${homeRgb.b}`);
  root.style.setProperty("--glass-border", `rgba(${rgb.r},${rgb.g},${rgb.b},.30)`);
  root.style.setProperty(
    "--glass-shadow-focus",
    `0 24px 72px rgba(0,0,0,.34),0 0 0 1px rgba(${rgb.r},${rgb.g},${rgb.b},.13),0 0 42px rgba(${rgb.r},${rgb.g},${rgb.b},.075),inset 0 1px 0 rgba(255,255,255,.20)`,
  );
  root.style.setProperty("--visual-tint", tint);
  root.style.setProperty("--custom-bg-color", backgroundColor);
  root.style.setProperty("--custom-bg-image", "none");
  root.style.setProperty("--custom-bg-image-opacity", "0");
  root.style.setProperty("--custom-bg-video-opacity", "0");
  root.style.setProperty("--custom-bg-overlay-opacity", "0");
  const body = root.ownerDocument?.body;
  body?.classList.toggle("custom-background-override", customBackgroundOverride);
  body?.classList.toggle("custom-background-flat", customBackgroundOverride);
  body?.classList.remove("custom-background-video");
  applyControlGlassChromaticOffset(root.ownerDocument, fx.controlGlassChromaticOffset);
}

function normalizeHexColor(value: unknown, fallback: string): string {
  const raw = typeof value === "string" ? value.trim() : "";
  const normalized = raw.startsWith("#") ? raw : `#${raw}`;
  return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized.toLowerCase() : fallback;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = Number.parseInt(hex.slice(1), 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

function clamp01(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.max(0, Math.min(1, n));
}

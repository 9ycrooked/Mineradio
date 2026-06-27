// NOTE: byte-equal port of the Electron baseline CSS for the bottom-bar console glass
// baseline and control-button motion selectors (public/index.html line 26-33 + 523-530
// + 569-570 + 617-621). User has a HARD requirement to preserve the SVG displacement map
// glass texture — do NOT replace with generic blur().

export const CONTROL_GLASS_CSS = `:root{--saved-panel-glass-bg:rgba(0,0,0,.10);--saved-panel-glass-filter:blur(12px) saturate(1.8) brightness(1.16);--saved-panel-glass-svg-filter:url(#mineradio-control-glass-filter) saturate(1);--saved-panel-glass-shadow:inset 0 0 2px 1px rgba(255,255,255,.35),inset 0 0 10px 4px rgba(255,255,255,.15),0 4px 16px rgba(17,17,26,.05),0 8px 24px rgba(17,17,26,.05),0 16px 56px rgba(17,17,26,.05),inset 0 4px 16px rgba(17,17,26,.05),inset 0 8px 24px rgba(17,17,26,.05),inset 0 16px 56px rgba(17,17,26,.05);--saved-panel-glass-radius:50px;--saved-button-glass-bg:rgba(0,0,0,.10);--saved-button-glass-filter:blur(12px) saturate(1.8) brightness(1.16);--saved-button-glass-svg-filter:url(#mineradio-control-glass-filter) saturate(1);--saved-button-glass-shadow:inset 0 0 2px 1px rgba(255,255,255,.34),inset 0 0 10px 4px rgba(255,255,255,.13),0 10px 30px rgba(0,0,0,.18);--saved-button-glass-hover-bg:rgba(255,255,255,.055);--saved-button-glass-hover-shadow:inset 0 0 2px 1px rgba(255,255,255,.42),inset 0 0 12px 5px rgba(255,255,255,.17),0 12px 34px rgba(0,0,0,.22),0 0 18px rgba(255,255,255,.06)}
.glass-saved-panel{background:var(--saved-panel-glass-bg);border:0;border-radius:var(--saved-panel-glass-radius);backdrop-filter:var(--saved-panel-glass-filter);-webkit-backdrop-filter:var(--saved-panel-glass-filter);box-shadow:var(--saved-panel-glass-shadow)}
html.control-glass-svg-ok .glass-saved-panel{background:var(--saved-panel-glass-bg);backdrop-filter:var(--saved-panel-glass-svg-filter);-webkit-backdrop-filter:var(--saved-panel-glass-svg-filter)}
.glass-saved-panel::before{content:none}
.glass-saved-button{border:0;background:var(--saved-button-glass-bg);backdrop-filter:var(--saved-button-glass-filter);-webkit-backdrop-filter:var(--saved-button-glass-filter);box-shadow:var(--saved-button-glass-shadow)}
html.control-glass-svg-ok .glass-saved-button{backdrop-filter:var(--saved-button-glass-svg-filter);-webkit-backdrop-filter:var(--saved-button-glass-svg-filter)}
.glass-saved-button:hover{background:var(--saved-button-glass-hover-bg);box-shadow:var(--saved-button-glass-hover-shadow)}
#bottom-bar{position:fixed;z-index:6;bottom:16px;left:50%;transform:translateX(-50%) translateY(36px) scale(.972);display:flex;flex-direction:column;align-items:center;gap:10px;opacity:0;pointer-events:none;filter:none;transition:opacity .34s cubic-bezier(.16,1,.3,1),bottom .34s cubic-bezier(.16,1,.3,1),width .34s,transform .46s cubic-bezier(.16,1,.3,1),filter .38s cubic-bezier(.16,1,.3,1);width:min(1080px,calc(100vw - 56px));padding:9px 22px 14px;border-radius:50px;background:transparent;border:0;backdrop-filter:none;-webkit-backdrop-filter:none;box-shadow:none}
html.control-glass-svg-ok #bottom-bar{backdrop-filter:none;-webkit-backdrop-filter:none}
#bottom-bar::before{content:none}
#bottom-bar::after{content:none}
#bottom-bar.visible{opacity:.91;pointer-events:auto;transform:translateX(-50%) translateY(0) scale(1);filter:blur(0);background:rgba(0,0,0,.10);backdrop-filter:blur(12px) saturate(1.8) brightness(1.16);-webkit-backdrop-filter:blur(12px) saturate(1.8) brightness(1.16);box-shadow:inset 0 0 2px 1px rgba(255,255,255,.35),inset 0 0 10px 4px rgba(255,255,255,.15),0 4px 16px rgba(17,17,26,.05),0 8px 24px rgba(17,17,26,.05),0 16px 56px rgba(17,17,26,.05),inset 0 4px 16px rgba(17,17,26,.05),inset 0 8px 24px rgba(17,17,26,.05),inset 0 16px 56px rgba(17,17,26,.05)}
html.control-glass-svg-ok #bottom-bar.visible{background:rgba(0,0,0,.10);backdrop-filter:url(#mineradio-control-glass-filter) saturate(1);-webkit-backdrop-filter:url(#mineradio-control-glass-filter) saturate(1)}
#bottom-bar.soft-hidden{opacity:0;pointer-events:none;transform:translateX(-50%) translateY(88px) scale(.972);filter:none;background:transparent;backdrop-filter:none;-webkit-backdrop-filter:none;box-shadow:none}
#play-mode-btn[data-mode="loop"]{color:rgba(255,255,255,.70)}
#play-mode-btn[data-mode="shuffle"],#play-mode-btn[data-mode="single"]{color:rgba(210,244,241,.90);text-shadow:0 0 12px rgba(0,245,212,.15)}
#play-mode-btn.mode-switching #play-mode-icon{animation:play-mode-pop .42s cubic-bezier(.16,1,.3,1)}
@keyframes play-mode-pop{0%{opacity:.4;transform:translateY(3px) scale(.84) rotate(-18deg)}65%{opacity:1;transform:translateY(-1px) scale(1.10) rotate(4deg)}100%{opacity:1;transform:translateY(0) scale(1) rotate(0)}}
#play-btn{width:58px;height:58px;border:0;border-radius:50%;color:rgba(255,255,255,.96);background:rgba(0,0,0,.10);transition:transform .20s cubic-bezier(.16,1,.3,1),background .20s,box-shadow .20s,filter .20s;box-shadow:inset 0 0 2px 1px rgba(255,255,255,.34),inset 0 0 10px 4px rgba(255,255,255,.13),0 10px 30px rgba(0,0,0,.18);backdrop-filter:blur(12px) saturate(1.8) brightness(1.16);-webkit-backdrop-filter:blur(12px) saturate(1.8) brightness(1.16)}
html.control-glass-svg-ok #play-btn{backdrop-filter:blur(24px) saturate(1) brightness(1);-webkit-backdrop-filter:blur(24px) saturate(1) brightness(1)}
#play-btn svg{width:24px;height:24px}
#play-btn:hover{background:rgba(255,255,255,.055);transform:translateY(-1px) scale(1.012);box-shadow:inset 0 0 2px 1px rgba(255,255,255,.42),inset 0 0 12px 5px rgba(255,255,255,.17),0 12px 34px rgba(0,0,0,.22),0 0 18px rgba(var(--fc-accent-rgb),.10)}
#play-btn:active{transform:translateY(0) scale(.965);box-shadow:inset 0 0 2px 1px rgba(255,255,255,.28),inset 0 0 10px 4px rgba(255,255,255,.10),0 8px 22px rgba(0,0,0,.20)}`;

const CONTROL_GLASS_STYLE_ID = "mineradio-control-glass-style";
let injected = false;

export function injectControlGlassStyle(root?: ShadowRoot | HTMLHeadElement | null): HTMLStyleElement | null {
	if (typeof document === "undefined") return null;
	if (injected) {
		const existing = document.getElementById(CONTROL_GLASS_STYLE_ID) as HTMLStyleElement | null;
		if (existing) return existing;
	}
	const owner = root ?? document.head;
	const style = document.createElement("style");
	style.id = CONTROL_GLASS_STYLE_ID;
	style.textContent = CONTROL_GLASS_CSS;
	owner.appendChild(style);
	injected = true;
	return style;
}
import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { EmptyHomeHost } from "./EmptyHomeHost";

test("EmptyHomeHost renders the baseline empty-home music landing structure", () => {
	const html = renderToStaticMarkup(React.createElement(EmptyHomeHost));
	expect(html).toContain('id="empty-home"');
	expect(html).toContain("🚧此处施工，敬请期待🚧");
	expect(html).toContain("展开播放器控制台");
	expect(html).toContain('class="home-grid"');
	expect(html).toContain("我的歌单");
	expect(html).toContain("每日推荐");
	expect(html).toContain("推荐歌曲");
	expect(html).toContain('id="home-tile-row"');
	expect(html).toContain('class="home-tile-action"');
});

test("EmptyHomeHost renders baseline logged-out starter tiles", () => {
	const html = renderToStaticMarkup(React.createElement(EmptyHomeHost, {
		discover: {
			loggedIn: false,
			user: null,
			dailySongs: [],
			playlists: [],
			podcasts: [],
			mode: "starter",
			updatedAt: 1782656256000,
		},
	}));

	expect(html).toContain("登录同步歌单");
	expect(html).toContain("搜索一首歌");
	expect(html).toContain("导入本地音乐");
	expect(html).toContain("搜索播客");
	expect(html).toContain("看看视觉舞台");
});

test("EmptyHomeHost renders discover songs, playlists, and podcasts into baseline cards and rail", () => {
	const html = renderToStaticMarkup(React.createElement(EmptyHomeHost, {
		discover: {
			loggedIn: true,
			user: { provider: "netease", userId: "42", nickname: "tester", avatarUrl: "" },
			mode: "member",
			dailySongs: [
				{ provider: "netease", id: "1", sourceId: "1", title: "第一首", artists: ["A"], album: "", coverUrl: "https://img.example/a.jpg", qualityHints: [], playableState: "playable" },
				{ provider: "netease", id: "2", sourceId: "2", title: "第二首", artists: ["B"], album: "", coverUrl: "https://img.example/b.jpg", qualityHints: [], playableState: "playable" },
				{ provider: "netease", id: "3", sourceId: "3", title: "第三首", artists: ["C"], album: "", coverUrl: "", qualityHints: [], playableState: "playable" },
			],
			playlists: [{ provider: "netease", id: "p1", name: "我的歌单", coverUrl: "https://img.example/p.jpg", trackCount: 8, trackIds: [], subscribed: false }],
			podcasts: [{ id: "r1", rid: "r1", name: "热门播客", coverUrl: "", description: "", djName: "DJ", category: "音乐", programCount: 5, subCount: 0 }],
			updatedAt: 1782656256000,
		},
	}));

	expect(html).toContain("第一首");
	expect(html).toContain("第二首");
	expect(html).toContain("第三首");
	expect(html).toContain("我的歌单");
	expect(html).toContain("热门播客");
	expect(html).toContain("刚刚更新 · 点击即可播放");
});

test("EmptyHomeHost routes the private radio card to the baseline Home private callback", async () => {
	await import("../../../../packages/visual-engine/src/runtime/happy-dom-preload");
	const calls: string[] = [];
	const host = document.createElement("div");
	document.body.appendChild(host);
	const root = createRoot(host);

	flushSync(() => root.render(<EmptyHomeHost onPlayPrivate={() => calls.push("private")} />));
	(host.querySelector('[data-home-card="private"]') as HTMLButtonElement).click();

	expect(calls).toEqual(["private"]);
	root.unmount();
	host.remove();
});

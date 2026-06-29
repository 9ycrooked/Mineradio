import { expect, test } from "bun:test";
import { DiscoverHomeResponseSchema } from "./discover";

const track = {
  provider: "netease",
  id: "100",
  sourceId: "100",
  title: "今日歌曲",
  artists: ["歌手"],
  album: "专辑",
  coverUrl: "https://img.example/cover.jpg",
  durationMs: 210000,
  qualityHints: ["standard"],
  playableState: "playable"
};

test("DiscoverHomeResponseSchema accepts the baseline Home discover payload shape", () => {
  const parsed = DiscoverHomeResponseSchema.parse({
    loggedIn: true,
    mode: "member",
    user: {
      provider: "netease",
      userId: "42",
      nickname: "tester",
      avatarUrl: "https://img.example/avatar.jpg"
    },
    dailySongs: [track],
    playlists: [{
      provider: "netease",
      id: "p1",
      name: "私人推荐",
      coverUrl: "https://img.example/p.jpg",
      trackCount: 12,
      trackIds: ["100"],
      subscribed: false
    }],
    podcasts: [{
      id: "r1",
      rid: "r1",
      name: "热门播客",
      coverUrl: "https://img.example/r.jpg",
      description: "",
      djName: "DJ",
      category: "音乐",
      programCount: 5,
      subCount: 10
    }],
    updatedAt: 1782656256000
  });

  expect(parsed.loggedIn).toBe(true);
  expect(parsed.mode).toBe("member");
  expect(parsed.dailySongs[0].title).toBe("今日歌曲");
  expect(parsed.playlists[0].name).toBe("私人推荐");
  expect(parsed.podcasts[0].name).toBe("热门播客");
});

test("DiscoverHomeResponseSchema preserves logged-out starter mode without recommendation payloads", () => {
  const parsed = DiscoverHomeResponseSchema.parse({
    loggedIn: false,
    user: null,
    dailySongs: [],
    playlists: [],
    podcasts: [],
    mode: "starter",
    updatedAt: 1782656256000
  });

  expect(parsed).toEqual({
    loggedIn: false,
    user: null,
    dailySongs: [],
    playlists: [],
    podcasts: [],
    mode: "starter",
    updatedAt: 1782656256000
  });
});

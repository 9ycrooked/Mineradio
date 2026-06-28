import { expect, test } from "bun:test";
import type { PlaylistSummary, PodcastCollection, Track } from "@mineradio/shared";
import { mapPodcastCollectionsToShelfItems, mapQueueToShelfItems, resolveShelfItems } from "./shelf-items";

function track(
	id: string,
	title: string,
	artists: string[],
	album = "",
	coverUrl = "",
): Track {
	return {
		provider: "netease",
		id,
		sourceId: id,
		title,
		artists,
		album,
		coverUrl,
		durationMs: 180_000,
		qualityHints: [],
		playableState: "playable",
	};
}

test("mapQueueToShelfItems tags the current track as playing and numbers the rest", () => {
	const queue = [
		track("a", "First", ["Ada", "Lin"], "Album A", "cover-a"),
		track("b", "Second", [], "Album B", "cover-b"),
	];

	const items = mapQueueToShelfItems(queue, queue[1]);

	expect(items).toEqual([
		{
			type: "queue",
			title: "First",
			sub: "Ada / Lin",
			cover: "cover-a",
			tag: "#1",
			queueIndex: 0,
			provider: "netease",
		},
		{
			type: "queue",
			title: "Second",
			sub: "Album B",
			cover: "cover-b",
			tag: "正在播放",
			queueIndex: 1,
			provider: "netease",
		},
	]);
});

test("mapQueueToShelfItems returns no hidden Mineradio host fixture when queue is empty", () => {
	const items = mapQueueToShelfItems([], null);

	expect(items).toEqual([]);
	expect(JSON.stringify(items)).not.toContain("Tauri shelf host fixture");
	expect(JSON.stringify(items)).not.toContain("Mineradio");
});

test("resolveShelfItems prefers provider playlists over queue fallback for the 3D shelf", () => {
	const playlists: PlaylistSummary[] = [
		{
			provider: "netease",
			id: "101",
			name: "我喜欢的音乐",
			coverUrl: "cover-like",
			trackCount: 12,
			trackIds: [],
			subscribed: false,
		},
		{
			provider: "qq",
			id: "201",
			name: "QQ 收藏",
			coverUrl: "cover-qq",
			trackCount: 3,
			trackIds: [],
			subscribed: true,
		},
	];
	const queue = [track("a", "Queued", ["Ada"], "Album", "cover-q")];

	const items = resolveShelfItems({ playlists, podcastCollections: [], queue, currentTrack: queue[0] });

	expect(items).toEqual([
		{
			type: "playlist",
			title: "我喜欢的音乐",
			sub: "12 首",
			cover: "cover-like",
			tag: "网易云",
			playlistId: "101",
			provider: "netease",
		},
		{
			type: "playlist",
			title: "QQ 收藏",
			sub: "3 首",
			cover: "cover-qq",
			tag: "QQ 音乐",
			playlistId: "201",
			provider: "qq",
		},
	]);
});

test("mapPodcastCollectionsToShelfItems mirrors baseline podcast collection cards", () => {
	const collections: PodcastCollection[] = [
		{
			key: "collect",
			title: "收藏播客",
			sub: "你收藏的播客",
			itemType: "radio",
			count: 2,
			coverUrl: "pod-cover",
		},
		{
			key: "liked",
			title: "喜欢的声音",
			sub: "收藏或最近喜欢的声音",
			itemType: "voice",
			count: 5,
			coverUrl: "",
		},
	];

	expect(mapPodcastCollectionsToShelfItems(collections)).toEqual([
		{
			type: "podcastCollection",
			title: "收藏播客",
			sub: "2 items",
			cover: "pod-cover",
			tag: "我的播客",
			podcastKey: "collect",
			itemType: "radio",
		},
		{
			type: "podcastCollection",
			title: "喜欢的声音",
			sub: "5 items",
			cover: "",
			tag: "我的播客",
			podcastKey: "liked",
			itemType: "voice",
		},
	]);
});

test("resolveShelfItems appends podcast collections after provider playlists before queue fallback", () => {
	const playlists: PlaylistSummary[] = [{
		provider: "netease",
		id: "101",
		name: "我喜欢的音乐",
		coverUrl: "cover-like",
		trackCount: 12,
		trackIds: [],
		subscribed: false,
	}];
	const podcastCollections: PodcastCollection[] = [{
		key: "liked",
		title: "喜欢的声音",
		sub: "收藏或最近喜欢的声音",
		itemType: "voice",
		count: 5,
		coverUrl: "voice-cover",
	}];
	const queue = [track("a", "Queued", ["Ada"], "Album", "cover-q")];

	expect(resolveShelfItems({ playlists, podcastCollections, queue, currentTrack: queue[0] })).toEqual([
		{
			type: "playlist",
			title: "我喜欢的音乐",
			sub: "12 首",
			cover: "cover-like",
			tag: "网易云",
			playlistId: "101",
			provider: "netease",
		},
		{
			type: "podcastCollection",
			title: "喜欢的声音",
			sub: "5 items",
			cover: "voice-cover",
			tag: "我的播客",
			podcastKey: "liked",
			itemType: "voice",
		},
	]);
});

test("resolveShelfItems falls back to queue when no provider playlist is available", () => {
	const queue = [track("a", "Queued", ["Ada"], "Album", "cover-q")];
	const items = resolveShelfItems({ playlists: [], podcastCollections: [], queue, currentTrack: queue[0] });

	expect(items[0]).toEqual({
		type: "queue",
		title: "Queued",
		sub: "Ada",
		cover: "cover-q",
		tag: "正在播放",
		queueIndex: 0,
		provider: "netease",
	});
});

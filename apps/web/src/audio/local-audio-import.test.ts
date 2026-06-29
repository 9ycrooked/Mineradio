import { expect, test } from "bun:test";
import {
  LOCAL_AUDIO_ACCEPT,
  createLocalAudioTrack,
  firstLocalAudioFile,
  isLocalAudioFile
} from "./local-audio-import";

test("isLocalAudioFile accepts the baseline audio extensions and MIME types", () => {
  expect(LOCAL_AUDIO_ACCEPT).toBe(".mp3,.flac,.wav,.ogg,.m4a,.jpg,.jpeg,.png,.webp");
  expect(isLocalAudioFile({ name: "song.MP3", type: "" })).toBe(true);
  expect(isLocalAudioFile({ name: "song", type: "audio/flac" })).toBe(true);
  expect(isLocalAudioFile({ name: "cover.png", type: "image/png" })).toBe(false);
});

test("firstLocalAudioFile picks the first audio file from a mixed import selection", () => {
  const files = [
    { name: "cover.jpg", type: "image/jpeg" },
    { name: "live.m4a", type: "" },
    { name: "other.mp3", type: "" }
  ];

  expect(firstLocalAudioFile(files)?.name).toBe("live.m4a");
});

test("createLocalAudioTrack maps a local file into a playback-compatible track", () => {
  const track = createLocalAudioTrack({
    name: "My Song.flac",
    type: "audio/flac",
    size: 1234,
    lastModified: 5678
  });

  expect(track).toEqual({
    provider: "netease",
    id: "local:My Song.flac:1234:5678",
    sourceId: "local:My Song.flac:1234:5678",
    title: "My Song",
    artists: ["本地文件"],
    album: "",
    coverUrl: "",
    durationMs: undefined,
    qualityHints: ["local"],
    playableState: "playable"
  });
});

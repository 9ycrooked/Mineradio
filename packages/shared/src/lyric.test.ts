import { expect, test } from "bun:test";
import { LyricPayloadSchema } from "./lyric";

test("LyricPayloadSchema carries native karaoke word timing without losing plain line fields", () => {
  const parsed = LyricPayloadSchema.parse({
    provider: "netease",
    trackId: "42",
    hasTranslation: true,
    isWordByWord: true,
    lines: [
      {
        timeMs: 1000,
        durationMs: 2000,
        text: "你好",
        translation: "hello",
        charCount: 2,
        source: "yrc-word",
        words: [
          { text: "你", timeMs: 1000, durationMs: 500, c0: 0, c1: 1 },
          { text: "好", timeMs: 1500, durationMs: 500, c0: 1, c1: 2 }
        ]
      }
    ]
  });

  expect(parsed.lines[0].timeMs).toBe(1000);
  expect(parsed.lines[0].durationMs).toBe(2000);
  expect(parsed.lines[0].translation).toBe("hello");
  expect(parsed.lines[0].charCount).toBe(2);
  expect(parsed.lines[0].source).toBe("yrc-word");
  expect(parsed.lines[0].words?.[1]).toEqual({
    text: "好",
    timeMs: 1500,
    durationMs: 500,
    c0: 1,
    c1: 2
  });
});

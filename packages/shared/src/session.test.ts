import { expect, test } from "bun:test";
import { ProviderLoginStatusSchema, ProviderLogoutAckSchema, ProviderSessionCookieAckSchema } from "./session";

test("ProviderSessionCookieAckSchema accepts provider + stored ack without cookie", () => {
  const parsed = ProviderSessionCookieAckSchema.parse({
    provider: "netease",
    stored: true,
  });

  expect(parsed.provider).toBe("netease");
  expect(parsed.stored).toBe(true);
  expect(JSON.stringify(parsed)).not.toContain("MUSIC_U");
  expect(JSON.stringify(parsed)).not.toContain("cookie");
});

test("ProviderSessionCookieAckSchema rejects cookie-bearing responses", () => {
  const parsed = ProviderSessionCookieAckSchema.safeParse({
    provider: "qq",
    stored: true,
    cookie: "uin=123; qqmusic_key=secret",
  });

  expect(parsed.success).toBe(false);
});

test("ProviderLoginStatusSchema accepts profile summaries without cookie", () => {
  const parsed = ProviderLoginStatusSchema.parse({
    provider: "netease",
    loggedIn: true,
    nickname: "tester",
    userId: "42",
  });

  expect(parsed.loggedIn).toBe(true);
  expect(JSON.stringify(parsed)).not.toContain("MUSIC_U");
  expect(JSON.stringify(parsed)).not.toContain("cookie");
});

test("ProviderLogoutAckSchema accepts logout ack without auth material", () => {
  const parsed = ProviderLogoutAckSchema.parse({
    provider: "netease",
    loggedOut: true,
  });

  expect(parsed.loggedOut).toBe(true);
  expect(JSON.stringify(parsed)).not.toContain("cookie");
});

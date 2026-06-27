import {
  cloudsearch,
  songDetail,
  songUrlV1,
  lyric,
  lyricNew,
  playlistDetail,
  playlistCatlist,
  loginStatus,
  logout
} from "hana-music-api";

export interface NeteaseConfig {
  cookie?: string;
}

export function getConfig(): NeteaseConfig {
  const cookie = process.env.MINERADIO_NETEASE_COOKIE;
  if (typeof cookie === "string" && cookie.trim().length > 0) return { cookie };
  return {};
}

export const hanaClient = {
  cloudsearch,
  songDetail,
  songUrlV1,
  lyric,
  lyricNew,
  playlistDetail,
  playlistCatlist,
  loginStatus,
  logout
} as const;
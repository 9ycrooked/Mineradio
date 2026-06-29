import type { Track } from "@mineradio/shared";

export const LOCAL_AUDIO_ACCEPT = ".mp3,.flac,.wav,.ogg,.m4a,.jpg,.jpeg,.png,.webp";

type LocalFileLike = {
  name: string;
  type?: string;
  size?: number;
  lastModified?: number;
};

export function isLocalAudioFile(file: LocalFileLike): boolean {
  const type = String(file.type ?? "").toLowerCase();
  if (type.startsWith("audio/")) return true;
  return /\.(mp3|flac|wav|ogg|m4a)$/i.test(file.name);
}

export function firstLocalAudioFile<T extends LocalFileLike>(files: Iterable<T> | ArrayLike<T>): T | null {
  const list = typeof (files as Iterable<T>)[Symbol.iterator] === "function"
    ? Array.from(files as Iterable<T>)
    : Array.from(files as ArrayLike<T>);
  return list.find(isLocalAudioFile) ?? null;
}

export function createLocalAudioTrack(file: LocalFileLike): Track {
  const id = `local:${file.name}:${file.size ?? 0}:${file.lastModified ?? 0}`;
  return {
    provider: "netease",
    id,
    sourceId: id,
    title: file.name.replace(/\.[^.]+$/, ""),
    artists: ["本地文件"],
    album: "",
    coverUrl: "",
    durationMs: undefined,
    qualityHints: ["local"],
    playableState: "playable"
  };
}

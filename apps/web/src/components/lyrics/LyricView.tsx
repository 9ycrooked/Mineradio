import { memo, useMemo, type ReactElement } from "react";
import type { LyricPayload } from "@mineradio/shared";
import { getLyricIndex, selectLyricIndexAtPosition } from "../../lyrics/lyric-index";

export interface LyricViewProps {
	payload: LyricPayload | null;
	positionMs: number;
}

function LyricViewImpl({ payload, positionMs }: LyricViewProps): ReactElement {
	const lyricIndex = useMemo(() => getLyricIndex(payload), [payload]);

	const currentIndex = useMemo(
		() => selectLyricIndexAtPosition(lyricIndex, positionMs),
		[positionMs, lyricIndex],
	);

	if (lyricIndex.lines.length === 0) {
		return (
			<div className="lyric-view" data-empty="true">
				<p className="lyric-empty">no lyrics</p>
			</div>
		);
	}

	return (
		<div className="lyric-view">
			<ul className="lyric-lines">
				{lyricIndex.lines.map(({ line }, index) => (
					<li
						key={`${index}-${line.timeMs}`}
						className={index === currentIndex ? "lyric-line lyric-current" : "lyric-line"}
						data-index={index}
					>
						{line.text || ""}
					</li>
				))}
			</ul>
		</div>
	);
}

export const LyricView = memo(LyricViewImpl);

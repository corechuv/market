// src/components/User/Tabs/ReelsGrid.tsx
import React from "react";
import clsx from "clsx";
import styles from "./Videos.module.scss";
import type { ReviewOut } from "../../../types/review/review";
import { posterFromMediaUrl } from "../../../services/reviewApi";
import ReelsLightbox from "../../Videos/ReelsLightbox";
import { formatViewsCount } from "../../../utils/formatViews";
import PlayIcon from "../../Icons/PlayIcon";

type Props = {
    items: ReviewOut[];
    emptyText?: string;
    /** Если передать — по клику навигируем/делаем что-то своё вместо лайтбокса */
    onItemClick?: (review: ReviewOut, index: number) => void;
    layout?: "default" | "search";
};

export default function ReelsGrid({ items, emptyText, onItemClick, layout = "default" }: Props) {
    const [open, setOpen] = React.useState(false);
    const [startIndex, setStartIndex] = React.useState(0);

    // ВСЕ хуки — до любых return
    const lightboxData = React.useMemo(
        () =>
            items
                .map((r) => {
                    const v = r.media.find((m) => m.kind === "video" && m.url);
                    const poster = posterFromMediaUrl(v?.url);
                    return { review: r, url: v?.url || "", poster };
                })
                .filter((x) => !!x.url),
        [items]
    );

    const hasData = lightboxData.length > 0;

    const handleClick = React.useCallback(
        (i: number, review: ReviewOut) => {
            if (onItemClick) {
                onItemClick(review, i);
            } else {
                setStartIndex(i);
                setOpen(true);
            }
        },
        [onItemClick] // setOpen / setStartIndex стабильны по ссылке
    );

    if (!hasData) {
        return (
            <div className={styles.muted}>
                {emptyText ?? "Здесь пока нет видео-отзывов."}
            </div>
        );
    }

    return (
        <>
            <div
                className={clsx(
                    styles.list__grid,
                    layout === "search" && styles.list__gridSearch
                )}
            >
                {lightboxData.map((it, i) => (
                    <div key={it.review.id} className={styles.list__item}>
                        <div className={styles.list__watch}>
                            <button
                                className={styles.list__btn}
                                onClick={() => handleClick(i, it.review)}
                                aria-label="Открыть ролик"
                            >
                                <div className={styles.list__preview}>
                                    {it.poster ? (
                                        <img
                                            src={it.poster}
                                            alt=""
                                            className={styles["list__preview--img"]}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className={styles["list__preview--placeholder"]}>
                                            Processing…
                                        </div>
                                    )}
                                    <div
                                        className={styles.list__views}
                                        aria-label={`Views: ${typeof it.review.viewsCount === "number" ? it.review.viewsCount : 0}`}
                                    >
                                        <PlayIcon className={styles.list__viewsIcon} />
                                        <span className={styles.list__viewsText}>
                                            {formatViewsCount(it.review.viewsCount)}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {open && !onItemClick && (
                <ReelsLightbox
                    items={lightboxData}
                    startIndex={startIndex}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}

// src/components/Videos/ReelsGrid.tsx
import React from "react";
import clsx from "clsx";
import styles from "./Videos.module.scss";
import type { ReviewOut } from "../../../types/review/review";
import { posterFromMediaUrl } from "../../../services/reviewApi";
import ReelsLightbox from "../../Videos/ReelsLightbox";

type Props = {
    items: ReviewOut[];
    emptyText?: string;
};

export default function ReelsGrid({ items, emptyText }: Props) {
    const [open, setOpen] = React.useState(false);
    const [startIndex, setStartIndex] = React.useState(0);

    if (!items.length) {
        return (
            <div className={styles.muted}>
                {emptyText ?? "Здесь пока нет видео-отзывов."}
            </div>
        );
    }

    const lightboxData = items
        .map((r) => {
            const v = r.media.find((m) => m.kind === "video" && m.url);
            const poster = posterFromMediaUrl(v?.url);
            return { review: r, url: v?.url || "", poster };
        })
        .filter((x) => !!x.url);

    if (!lightboxData.length) {
        return (
            <div className={styles.muted}>
                {emptyText ?? "Здесь пока нет видео-отзывов."}
            </div>
        );
    }

    return (
        <>
            <div className={clsx(styles.list__grid)}>
                {lightboxData.map((it, i) => (
                    <div key={it.review.id} className={styles.list__item}>
                        <div className={styles.list__watch}>
                            <button
                                className={styles.list__btn}
                                onClick={() => {
                                    setStartIndex(i);
                                    setOpen(true);
                                }}
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
                                </div>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {open && (
                <ReelsLightbox
                    items={lightboxData}
                    startIndex={startIndex}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}

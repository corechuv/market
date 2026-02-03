// src/components/Videos/VideoCard.tsx
import React from "react";
import cls from "./VideoCard.module.scss";
import { formatViewsCount } from "../../utils/formatViews";
import PlayIcon from "../Icons/PlayIcon";

export type VideoCardProps = {
    poster?: string;
    title?: string | null;
    viewsCount?: number;
    onClick?: () => void;
};

const VideoCard: React.FC<VideoCardProps> = ({ poster, title, viewsCount, onClick }) => {
    const safeViews = typeof viewsCount === "number" ? viewsCount : 0;
    return (
        <article className={cls.item} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : -1}>
            <div className={cls.item__preview} aria-hidden>
                {poster ? (
                    <img className={cls["item__preview--img"]} src={poster} alt="" loading="lazy" />
                ) : (
                    <div className={cls["item__preview--placeholder"]}>Processing…</div>
                )}
                <div className={cls.item__views} aria-label={`Views: ${safeViews}`}>
                    <PlayIcon className={cls.item__viewsIcon} />
                    <span className={cls.item__viewsText}>{formatViewsCount(safeViews)}</span>
                </div>
            </div>
            {title ? <div className={cls.item__title} title={title}>{title}</div> : null}
        </article>
    );
};

export default VideoCard;

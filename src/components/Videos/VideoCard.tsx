// src/components/Videos/VideoCard.tsx
import React from "react";
import cls from "./VideoCard.module.scss";

export type VideoCardProps = {
    poster?: string;
    title?: string | null;
    onClick?: () => void;
};

const VideoCard: React.FC<VideoCardProps> = ({ poster, title, onClick }) => {
    return (
        <article className={cls.item} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : -1}>
            <div className={cls.item__preview} aria-hidden>
                {poster ? (
                    <img className={cls["item__preview--img"]} src={poster} alt="" loading="lazy" />
                ) : (
                    <div className={cls["item__preview--placeholder"]}>Processing…</div>
                )}
            </div>
            {title ? <div className={cls.item__title} title={title}>{title}</div> : null}
        </article>
    );
};

export default VideoCard;

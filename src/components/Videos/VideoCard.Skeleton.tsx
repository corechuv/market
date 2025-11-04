// src/components/Videos/VideoCard.Skeleton.tsx
import React from "react";
import cls from "./VideoCard.module.scss";

type Props = { withTitle?: boolean };

const VideoCardSkeleton: React.FC<Props> = ({ withTitle = true }) => {
  return (
    <article className={`${cls.item} ${cls["item--skeleton"]}`} aria-busy="true" aria-label="Loading video">
      <div className={cls.item__preview} aria-hidden>
        <div className={`${cls.skeletonBlock} ${cls["item__preview--placeholder"]}`} />
      </div>
      {withTitle && (
        <div className={cls.item__title}>
          <span className={cls.skeletonLine} style={{ width: "85%", height: 18 }} />
        </div>
      )}
    </article>
  );
};

export default VideoCardSkeleton;

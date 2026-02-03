import React from "react";
import Carousel from "../UI/Carousel/Carousel";
import VideoCard from "./VideoCard";
import VideoCardSkeleton from "./VideoCard.Skeleton";

export type VideoItem = {
  id: string | number;
  poster?: string;
  title?: string | null;
  viewsCount?: number;
  onClick?: () => void;
};

export interface VideoCarouselProps {
  items: VideoItem[];
  className?: string;
  label?: string;
  isLoading?: boolean;
  skeletonCount?: number;
}

const VideoCarousel: React.FC<VideoCarouselProps> = ({
  items,
  className = "",
  label,
  isLoading = false,
  skeletonCount = 6,
}) => {
  if (isLoading) {
    const placeholders = Array.from({ length: skeletonCount }, (_, i) => i);
    return (
      <Carousel<number>
        items={placeholders}
        className={className}
        label={label}
        getKey={(n) => `video-skeleton-${n}`}
        renderItem={() => <VideoCardSkeleton />}
      />
    );
  }

  return (
    <Carousel<VideoItem>
      items={items}
      className={className}
      label={label}
      getKey={(it) => it.id}
      renderItem={({ item }) => (
        <VideoCard
          poster={item.poster}
          title={item.title}
          viewsCount={item.viewsCount}
          onClick={item.onClick}
        />
      )}
    />
  );
};

export default React.memo(VideoCarousel);

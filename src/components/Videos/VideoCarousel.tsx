// src/components/Videos/VideoCarousel.tsx
import React from "react";
import Carousel from "../UI/Carousel/Carousel";
import VideoCard from "./VideoCard";

export type VideoItem = {
    id: string | number;
    poster?: string;
    title?: string | null;
    onClick?: () => void;
};

export interface VideoCarouselProps {
    items: VideoItem[];
    className?: string;
    label?: string;
}

const VideoCarousel: React.FC<VideoCarouselProps> = ({ items, className = "", label }) => {
    return (
        <Carousel
            items={items}
            className={className}
            label={label}
            getKey={(it) => it.id}
            renderItem={({ item }) => (
                <VideoCard poster={item.poster} title={item.title} onClick={item.onClick} />
            )}
        />
    );
};

export default React.memo(VideoCarousel);

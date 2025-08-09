import { useState } from "react";
import StarIcon from "../Icons/StarIcon";

type StarsProps = {
    size?: number; // размер иконки в px
    value?: number; // выбранное количество звезд
    onChange?: (value: number) => void;
};

export default function Stars({ size = 24, value = 0, onChange }: StarsProps) {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div className="stars-container" style={{ display: "flex", gap: 4, cursor: "pointer" }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={() => onChange && setHovered(star)}
                    onMouseLeave={() => onChange && setHovered(null)}
                    onClick={() => onChange && onChange(star)}
                >
                    <StarIcon
                        width={size}
                        height={size}
                        fill={
                            (hovered !== null ? star <= hovered : star <= value)
                                ? "var(--bg-star-active)"
                                : "var(--bg-star)"
                        }
                    />
                </span>
            ))}
        </div>
    );
}
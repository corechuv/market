import "react";

/**
* Идеально симметричная звезда 5-конечная на основе правильного многоугольника
* Вектор построен в системе 100x100 для большей точности и аккуратного масштабирования
*/
export default function StarIcon(props: React.SVGProps<SVGSVGElement>): React.ReactElement {
    const { fill = "currentColor", ...rest } = props;
    return (
        <svg
            viewBox="0 0 100 100"
            aria-hidden="true"
            preserveAspectRatio="xMidYMid meet"
            shapeRendering="geometricPrecision"
            {...rest}
        >
            {/* Точки рассчитаны по золотому сечению для ровной пятиконечной звезды */}
            <polygon
                points="50,0 61.226,34.549 97.553,34.549 68.164,55.902 79.389,90.451 50,69.098 20.611,90.451 31.836,55.902 2.447,34.549 38.774,34.549"
                fill={fill}
                stroke="none"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}
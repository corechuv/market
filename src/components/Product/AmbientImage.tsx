// ВНИМАНИЕ: это внутри того же файла ProductCarouselRich.tsx
import React, { useEffect, useState } from "react";
import cls from "./ProductCarousel.module.scss";

type AmbientImageProps = {
  src: string;
  alt: string;
  className?: string;
  children?: React.ReactNode;
};

/** Считает усреднённый (по непрозрачным пикселям) цвет картинки */
async function computeAverageColor(src: string): Promise<string> {
  if (typeof window === "undefined") return "#f5f5f7";

  const img = new Image();
  img.crossOrigin = "anonymous"; // важно для CDN; если нет CORS — просто будет fallback
  img.decoding = "async";
  img.src = src;

  // ждём декодирования изображения
  await img.decode().catch(() => {});

  const w = 32;
  const h = 32;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#f5f5f7";

  try {
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);

    let r = 0, g = 0, b = 0, aAcc = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3] / 255;
      if (a < 0.1) continue; // игнорим почти прозрачные пиксели
      r += data[i] * a;
      g += data[i + 1] * a;
      b += data[i + 2] * a;
      aAcc += a;
      count++;
    }
    if (count === 0 || aAcc === 0) return "#f5f5f7";

    r = Math.round(r / aAcc);
    g = Math.round(g / aAcc);
    b = Math.round(b / aAcc);

    // чуть высветлим, чтобы текст/лейблы не терялись
    const lighten = (c: number) => Math.round((c + 255 * 2) / 3);
    return `rgb(${lighten(r)}, ${lighten(g)}, ${lighten(b)})`;
  } catch {
    return "#f5f5f7";
  }
}

const AmbientImage: React.FC<AmbientImageProps> = ({ src, alt, className, children }) => {
  const [ambient, setAmbient] = useState<string>("#f5f5f7");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const color = await computeAverageColor(src);
        if (!cancelled) setAmbient(color);
      } catch {
        // noop — останется дефолтный фон
      }
    })();
    return () => { cancelled = true; };
  }, [src]);

  return (
    <div
      className={`${cls.imageWrap} ${className ?? ""}`}
      style={{
        ["--ambient" as any]: ambient,                 // цвет-подложка
        ["--bg-url" as any]: `url("${src}")`,          // фон-«размытая копия»
      }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        crossOrigin="anonymous"
        className={cls.productImage}
      />
      {children}
    </div>
  );
};

export default AmbientImage;

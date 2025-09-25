import { useEffect, useState } from "react";
import styles from "./BrandCarousel.module.scss";

export type BrandImage = {
  name?: string;
  alt?: string;
  src?: string;
  light?: { svg?: string; png?: string; src?: string };
  dark?: { svg?: string; png?: string; src?: string };
};

type Props = {
  images: BrandImage[];
  className?: string;
  label?: string;
  ariaLabel?: string;
};

type Theme = "light" | "dark";

function pickByMode(img: BrandImage, mode: Theme) {
  const side = img[mode];
  return side?.svg || side?.png || side?.src || img.src;
}
function pickAny(img: BrandImage) {
  return pickByMode(img, "light") || pickByMode(img, "dark") || img.src;
}

export default function BrandCarousel({
  images,
  className,
  label,
  ariaLabel,
}: Props) {
  // null на первом рендере (SSR/гидратация), затем 'light' | 'dark'
  const [resolvedTheme, setResolvedTheme] = useState<Theme | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const body = document.body;
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");

    const readAttr = (): Theme | null => {
      const v =
        root.getAttribute("data-theme") ||
        body?.getAttribute("data-theme") ||
        null;
      return v === "dark" ? "dark" : v === "light" ? "light" : null;
    };

    const compute = (): Theme => {
      const attr = readAttr();
      if (attr) return attr;
      // «System» режим: если атрибута нет — следуем ОС
      return mql && "matches" in mql && mql.matches ? "dark" : "light";
    };

    const apply = () => {
      const next = compute();
      setResolvedTheme((prev) => (prev === next ? prev : next));
    };

    // 1) первичная установка
    apply();

    // 2) слушаем смену data-theme
    const mo = new MutationObserver(apply);
    mo.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    if (body) mo.observe(body, { attributes: true, attributeFilter: ["data-theme"] });

    // 3) слушаем смену системной темы (если нет data-theme)
    const onMql = () => {
      if (!readAttr()) apply();
    };
    if (mql) {
      if (typeof mql.addEventListener === "function") mql.addEventListener("change", onMql);
      else mql.addListener?.(onMql);
    }

    return () => {
      mo.disconnect();
      if (mql) {
        if (typeof mql.removeEventListener === "function") mql.removeEventListener("change", onMql);
        else mql.removeListener?.(onMql);
      }
    };
  }, []);

  return (
    <div className={styles.listContainer}>
      {label ? <h2 className={styles.title}>{label}</h2> : null}
      <div className={`${styles.root} ${className ?? ""}`}>
        <ul className={styles.track} aria-label={ariaLabel ?? "Бренды"} role="list">
          {images.map((img, i) => {
            const alt = img.alt ?? img.name ?? "";

            // Пока тема не определилась (первый рендер/SSR) — безопасный <picture> с авто-выбором
            if (resolvedTheme === null) {
              const fallback = pickAny(img) ?? "";
              return (
                <li className={styles.item} key={i}>
                  <picture>
                    {img.dark?.svg && (
                      <source srcSet={img.dark.svg} media="(prefers-color-scheme: dark)" type="image/svg+xml" />
                    )}
                    {img.dark?.png && <source srcSet={img.dark.png} media="(prefers-color-scheme: dark)" />}
                    {img.light?.svg && (
                      <source srcSet={img.light.svg} media="(prefers-color-scheme: light)" type="image/svg+xml" />
                    )}
                    {img.light?.png && <source srcSet={img.light.png} media="(prefers-color-scheme: light)" />}
                    <img src={fallback} alt={alt} loading="lazy" draggable={false} />
                  </picture>
                </li>
              );
            }

            // Когда тема известна — рендерим один конкретный src (без <picture>)
            const forced = pickByMode(img, resolvedTheme) ?? pickAny(img) ?? "";
            return (
              <li className={styles.item} key={i}>
                <img src={forced} alt={alt} loading="lazy" draggable={false} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

import "react";
import styles from "./ReviewsHistogram.module.scss";

type Bucket = {
  /** Целая «звёздная» оценка, например 1..5 */
  rating: number;
  /** Кол-во отзывов с такой оценкой */
  count: number;
};

type Props = {
  /** Набор данных. Отсутствующие оценки будут дополнены нулями. */
  data: Bucket[];
  /** Максимальная оценка (по умолчанию 5) */
  maxRating?: number;
  /** Порядок строк: по убыванию (5→1), по возрастанию (1→5) или как пришло */
  sort?: "desc" | "asc" | "none";
  /** Локаль для форматирования чисел */
  locale?: string;
  /** Принудительная тема: 'light' | 'dark' | 'auto' (по умолчанию 'auto') */
  theme?: "light" | "dark" | "auto";
  /** Доп. className контейнера */
  className?: string;
  /** Кастомная подпись для строки рейтинга */
  ratingLabel?: (rating: number) => string;
};

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

export default function ReviewsHistogram({
  data,
  maxRating = 5,
  sort = "desc",
  locale = "ru-RU",
  theme = "auto",
  className,
  ratingLabel,
}: Props) {
  // Дополним пропуски нулями и нормализуем порядок
  const counts = new Map<number, number>();
  for (let i = 1; i <= maxRating; i++) counts.set(i, 0);
  data.forEach(({ rating, count }) => {
    if (Number.isFinite(rating) && Number.isFinite(count)) {
      const r = Math.round(rating);
      if (r >= 1 && r <= maxRating) counts.set(r, (counts.get(r) || 0) + Math.max(0, Math.floor(count)));
    }
  });

  let rows = Array.from(counts.entries()).map(([rating, count]) => ({ rating, count }));
  if (sort === "desc") rows.sort((a, b) => b.rating - a.rating);
  else if (sort === "asc") rows.sort((a, b) => a.rating - b.rating);
  // sort === 'none' — оставляем как есть

  const total = rows.reduce((s, r) => s + r.count, 0);
  const nfInt = new Intl.NumberFormat(locale);

  // Для a11y и заголовка
  const title = `Распределение ${nfInt.format(total)} отзывов по оценкам`;

  return (
    <section
      className={[styles.root, className].filter(Boolean).join(" ")}
      {...(theme !== "auto" ? { "data-theme": theme } : {})}
      aria-label={title}
    >
      <ul className={styles.list} role="list">
        {rows.map(({ rating, count }) => {
          const pct = total > 0 ? (count / total) * 100 : 0;
          const pctRounded = clamp(pct);
          const labelText = ratingLabel ? ratingLabel(rating) : `${rating} ★`;

          return (
            <li key={rating} className={styles.row}>
              <div className={styles.label} aria-hidden="true" title={labelText}>
                {labelText}
              </div>

              <div className={styles.bar} role="img">
                <div
                  className={styles.fill}
                  style={{ width: `${pctRounded}%` }}
                />
              </div>

              <div className={styles.count} title={`${nfInt.format(count)} шт.`} aria-hidden="true">
                {nfInt.format(count)}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

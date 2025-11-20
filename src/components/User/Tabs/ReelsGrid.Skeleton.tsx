// src/components/User/Tabs/ReelsGrid.Skeleton.tsx
import React from "react";
import clsx from "clsx";
import styles from "./Videos.module.scss";

type Props = {
  /** Сколько скелетон-плиток показать (если не указать — подберётся из layout) */
  count?: number;
  layout?: "default" | "search";
};

const ReelsGridSkeleton: React.FC<Props> = ({ count, layout = "default" }) => {
  const effectiveCount = count ?? (layout === "search" ? 9 : 18);

  const items = React.useMemo(
    () => Array.from({ length: effectiveCount }, (_, i) => i),
    [effectiveCount]
  );

  return (
    <div
      className={clsx(styles.list, styles["list--skeleton"])}
      aria-busy="true"
      aria-label="Loading videos"
    >
      <div
        className={clsx(
          styles.list__grid,
          layout === "search" && styles.list__gridSearch
        )}
      >
        {items.map((i) => (
          <div key={i} className={styles.list__item}>
            <div className={styles.list__watch}>
              <div className={styles.list__preview}>
                <div className={styles["list__preview--skeleton"]} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReelsGridSkeleton;

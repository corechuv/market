// src/components/Catalog/CatalogScreens.tsx
import React from "react";
import Right from "../Icons/ChevronRightIcon";
import MasterBar from "../UI/Bars/MasterBar";
import ScrollArea from "../UI/ScrollArea/ScrollArea";
import type { Category as Cat } from "../../types/category";
import c from "./CatalogScreens.module.scss";
import Left from "../Icons/ChevronLeftIcon";

interface Props {
  title?: string;
  stage: "L1" | "L2" | "L3";
  isLoading: boolean;
  error: boolean;
  roots: Cat[];
  l2List: Cat[];
  l3List: Cat[];
  rootCat: Cat | null;
  l2Cat: Cat | null;
  back: () => void;
  screenClass: (name: "L1" | "L2" | "L3", cls: Record<string, string>) => string;
  refs: {
    l1: React.RefObject<HTMLDivElement | null>;
    l2: React.RefObject<HTMLDivElement | null>;
    l3: React.RefObject<HTMLDivElement | null>;
  };
  touch: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
  onOpenL2: (c: Cat) => void;
  onOpenL3: (c: Cat) => void;
  onOpenSlug: (slug: string) => void;
  mastbarBg?: string;
  lockBody?: boolean;
}

export const CatalogScreens: React.FC<Props> = (p) => {
  const lock = p.lockBody ?? true; // default: true

  return (
    <div className={c.content}>
      <MasterBar
        title={p.stage === "L1" ? (p.title ?? "Catalog") : ""}
        background={p.mastbarBg}
      >
        {p.stage !== "L1" && (
          <button
            className={c.back}
            onClick={p.back}
            aria-label="Back"
            type="button"
          >
            <Left />
            Back
          </button>
        )}
      </MasterBar>

      <div className={c.drawer}>
        {/* L1 */}
        <div className={p.screenClass("L1", c)}>
          <ScrollArea lockBody={lock && p.stage === "L1"} ref={p.refs.l1 as any}>
            {p.isLoading ? (
              <div className={c.skeleton} role="status" aria-live="polite">
                Загрузка…
              </div>
            ) : p.error && p.roots.length === 0 ? (
              <div className={c.skeleton} role="alert">
                Не удалось загрузить категории
              </div>
            ) : (
              <ul className={c.list}>
                {p.roots.map((cat) => (
                  <li
                    key={cat.id}
                    className={c.list__item}
                    onClick={() => p.onOpenL2(cat)}
                  >
                    <span className={c["list__item--label"]} title={cat.name}>
                      {cat.name}
                    </span>
                    <Right className={c["list__item--icon-right"]} />
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>

        {/* L2 */}
        <div
          className={p.screenClass("L2", c)}
          onTouchStart={p.touch.onTouchStart}
          onTouchEnd={p.touch.onTouchEnd}
        >
          <ScrollArea lockBody={lock && p.stage === "L2"} ref={p.refs.l2 as any}>
            {p.rootCat && (
              <ul className={c.list}>
                <li
                  className={c.list__item}
                  onClick={() =>
                    p.rootCat?.fullSlug && p.onOpenSlug(p.rootCat.fullSlug)
                  }
                >
                  <span
                    className={c["list__item--label"]}
                    title={p.rootCat.name}
                  >
                    {p.rootCat.name}
                  </span>
                </li>
                {p.l2List.map((l2) => (
                  <li
                    key={l2.id}
                    className={c.list__item}
                    onClick={() => p.onOpenL3(l2)}
                  >
                    <span className={c["list__item--label"]} title={l2.name}>
                      {l2.name}
                    </span>
                    <Right className={c["list__item--icon-right"]} />
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>

        {/* L3 */}
        <div
          className={p.screenClass("L3", c)}
          onTouchStart={p.touch.onTouchStart}
          onTouchEnd={p.touch.onTouchEnd}
        >
          <ScrollArea lockBody={lock && p.stage === "L3"} ref={p.refs.l3 as any}>
            {p.l2Cat && (
              <ul className={c.list}>
                <li
                  className={c.list__item}
                  onClick={() =>
                    p.l2Cat?.fullSlug && p.onOpenSlug(p.l2Cat.fullSlug)
                  }
                >
                  <span className={c["list__item--label"]} title={p.l2Cat.name}>
                    {p.l2Cat.name}
                  </span>
                </li>
                {p.l3List.map((leaf) => (
                  <li
                    key={leaf.id}
                    className={c.list__item}
                    onClick={() =>
                      leaf.fullSlug && p.onOpenSlug(leaf.fullSlug)
                    }
                  >
                    <span className={c["list__item--label"]} title={leaf.name}>
                      {leaf.name}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

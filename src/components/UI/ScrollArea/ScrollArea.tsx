// src/components/UI/ScrollArea/ScrollArea.tsx
import React, { useEffect, useRef, forwardRef } from "react";
import clsx from "clsx";
import s from "./ScrollArea.module.scss";
import {
  acquireBodyLock,
  releaseBodyLock,
  registerScrollArea,
  unregisterScrollArea,
} from "../../../utils/scroll/lock";

type ScrollAreaProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Блокировать скролл документа при маунте */
  lockBody?: boolean;
  /** Отступ снизу под нижнюю навигацию (px или CSS-выражение). Необязателен */
  bottomOffset?: number | string;
  /** Автоматически учитывать нижнюю навигацию */
  useBottomNavOffset?: boolean;
};

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (value: T | null) => {
    refs.forEach((r) => {
      if (!r) return;
      if (typeof r === "function") r(value);
      else (r as React.MutableRefObject<T | null>).current = value;
    });
  };
}

const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  {
    className,
    children,
    lockBody = true,
    bottomOffset = 0,
    useBottomNavOffset = false,
    style,
    ...rest
  },
  ref
) {
  const areaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    registerScrollArea(el);
    return () => unregisterScrollArea(el);
  }, []);

  useEffect(() => {
    if (!lockBody) return;
    acquireBodyLock();
    return () => releaseBodyLock();
  }, [lockBody]);

  const offsetStr =
    typeof bottomOffset === "string" ? bottomOffset : `${bottomOffset}px`;
  const navStr =
    "var(--bottom-nav-h, 60px) + var(--bottom-nav-offset, 0px) + env(safe-area-inset-bottom) + var(--bottom-nav-vb, 0px)";

  return (
    <div
      ref={mergeRefs(areaRef, ref)}
      className={clsx(s.s, className)}
      data-scroll-area
      style={{
        ...style,
        // место под навигацию + учёт клавиатуры, если хочешь
        paddingBottom: `calc(${useBottomNavOffset ? navStr : "0px"} + ${offsetStr} + var(--kb, 0px))`,
      }}
      {...rest}
    >
      {children}
    </div>
  );
});

ScrollArea.displayName = "ScrollArea";
export default ScrollArea;

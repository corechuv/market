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
  { className, children, lockBody = true, ...rest },
  ref
) {
  const areaRef = useRef<HTMLDivElement>(null);

  // Регистрируем область как «разрешённую» для тач-скролла
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    registerScrollArea(el);
    return () => unregisterScrollArea(el);
  }, []);

  // Единая глобальная локировка через менеджер
  useEffect(() => {
    if (!lockBody) return;
    acquireBodyLock();
    return () => releaseBodyLock();
  }, [lockBody]);

  return (
    <div
      ref={mergeRefs(areaRef, ref)}
      className={clsx(s.s, className)}
      data-scroll-area
      {...rest}
    >
      {children}
    </div>
  );
});

ScrollArea.displayName = "ScrollArea";
export default ScrollArea;

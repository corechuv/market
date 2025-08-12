// Catalog.tsx – desktop dropdown + mobile drawer (обновлено "категории → товары" свайп)
import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

import type { Category as Cat } from "../../types/category";
import { getRootCategories, getChildren } from "../../services/categoryService";

import cls from "./Catalog.module.scss";
import CloseIcon from "../Icons/CloseIcon";
import HamburgerIcon from "../Icons/HamburgerIcon";
import Modal from "../Modal/Modal";
import ChevronRightIcon from "../Icons/ChevronLeftIcon";
import ChevronLeftIcon from "../Icons/ChevronRightIcon";
import Logo from "../logo/Logo";

import { createPortal } from "react-dom";
import SunIcon from "../Icons/SunIcon";
import MoonIcon from "../Icons/MoonIcon";

function Overlay({ visible, onClick }: { visible: boolean; onClick?: () => void }) {
  return createPortal(
    <div
      className={`${cls.overlay} ${visible ? cls.overlayVisible : ""}`}
      onClick={onClick}
      aria-hidden={!visible}
    />,
    document.body
  );
}

type CatalogProps = {
  trigger?: "click" | "hover";
  initialActiveId?: string;
  showCloseButton?: boolean;
  onSelect?: (id: string | null) => void;
  className?: string;
  children?: ReactNode;
  mobileDrawerOpen?: boolean;
  onMobileDrawerOpenChange?: (open: boolean) => void;
  renderMobileHamburger?: boolean;
};

type MobileStage = "L1" | "L2" | "L3";

export default function Catalog({
  trigger = "click",
  initialActiveId,
  showCloseButton = trigger === "click",
  onSelect,
  className = "",
  children,
  mobileDrawerOpen,
  onMobileDrawerOpenChange,
  renderMobileHamburger = true,
}: CatalogProps) {
  const nav = useNavigate();

  const [isHover, setIsHover] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // 🔥 РУТЫ каталога (L1)
  const roots = useMemo(() => getRootCategories(), []);

  // активный корень (desktop)
  const initialActive = useMemo<Cat | null>(() => {
    if (initialActiveId) return roots.find((r) => r.id === initialActiveId) ?? null;
    return null;
  }, [initialActiveId, roots]);
  const [active, setActive] = useState<Cat | null>(initialActive);

  const select = useCallback(
    (cat: Cat | null) => {
      setActive(cat);
      onSelect?.(cat ? cat.id : null);
    },
    [onSelect]
  );

  const toggle = useCallback(
    (cat: Cat) => select(active?.id === cat.id ? null : cat),
    [active, select]
  );

  // -------- MOBILE DRAWER (3 экрана) --------
  const [internalOpen, setInternalOpen] = useState(false);
  const drawerOpen = mobileDrawerOpen ?? internalOpen;
  const setDrawerOpen = (open: boolean) =>
    onMobileDrawerOpenChange ? onMobileDrawerOpenChange(open) : setInternalOpen(open);

  const [stage, setStage] = useState<MobileStage>("L1");
  const [rootCat, setRootCat] = useState<Cat | null>(null); // выбранный L1
  const [l2Cat, setL2Cat] = useState<Cat | null>(null); // выбранный L2

  const l2List = useMemo<Cat[]>(() => (rootCat ? getChildren(rootCat.id) : []), [rootCat]);
  const l3List = useMemo<Cat[]>(() => (l2Cat ? getChildren(l2Cat.id) : []), [l2Cat]);

  useEffect(() => {
    if (!drawerOpen) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen, stage]);

  const openL2 = (cat: Cat) => {
    setRootCat(cat);
    setL2Cat(null);
    setStage("L2");
  };

  const openL3 = (cat: Cat) => {
    const children = getChildren(cat.id);
    if (!children.length) {
      // нет L3 — сразу переходим
      closeDrawer();
      nav(`/category${cat.fullSlug}`);
      return;
    }
    setL2Cat(cat);
    setStage("L3");
  };

  const back = () => {
    if (stage === "L3") {
      setStage("L2");
      return;
    }
    if (stage === "L2") {
      setStage("L1");
      setL2Cat(null);
      return;
    }
    closeDrawer();
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setStage("L1");
    setRootCat(null);
    setL2Cat(null);
  };

  // свайп-назад (вправо) на L2/L3
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 60) back(); // свайп вправо → назад
    touchStartX.current = null;
  };

  const overlayVisible =
    (trigger === "hover" && (isHover || !!active)) ||
    (trigger === "click" && !!active);

  // тема (как было)
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) return saved;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 🔥 L2/L3 для активного корня (desktop)
  const level2 = useMemo(() => (active ? getChildren(active.id) : []), [active]);
  const level3ByL2 = useMemo(() => {
    const map = new Map<string, Cat[]>();
    level2.forEach((l2) => map.set(l2.id, getChildren(l2.id)));
    return map;
  }, [level2]);

  // класс экрана для слайдов
  const screenClass = (name: MobileStage) => {
    if (stage === name) return cls.screenActive;
    if (name === "L1") return stage === "L2" || stage === "L3" ? cls.screenHiddenLeft : cls.screenHiddenRight;
    if (name === "L2") return stage === "L1" ? cls.screenHiddenRight : cls.screenHiddenLeft;
    // name === "L3"
    return cls.screenHiddenRight;
  };

  const handleClick = useCallback(
    (cat: Cat, e: React.MouseEvent<HTMLAnchorElement>) => {
      if (trigger !== "click") return;
      e.preventDefault();
      toggle(cat);
    },
    [trigger, toggle]
  );

  const handleMouseEnter = useCallback(
    (cat: Cat) => trigger === "hover" && select(cat),
    [trigger, select]
  );
  const handleMouseLeave = () => trigger === "hover" && select(null);

  return (
    <>
      <Overlay
        visible={overlayVisible && !isMobile}
        onClick={() => {
          if (trigger === "click") select(null);
        }}
      />

      <div
        className={`${cls.catalogContainer} ${active ? cls.isOpen : ""} ${
          isHover ? cls.isHover : ""
        }`}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <nav className={`${cls.catalog} ${className}`} onMouseLeave={handleMouseLeave}>
          {/* MOBILE HAMBURGER */}
          {isMobile && renderMobileHamburger && (
            <button
              className={cls.hamburger}
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <HamburgerIcon />
            </button>
          )}

          {/* DESKTOP NAV: корневые категории */}
          <ul className={cls.categories} aria-label="Catalog navigation">
            {roots.map((cat) => (
              <li key={cat.id} className={cls.categoryItem}>
                <a
                  href={`/category${cat.fullSlug}`}
                  className={
                    active?.id === cat.id
                      ? `${cls.categoryLink} ${cls.categoryLinkActive}`
                      : cls.categoryLink
                  }
                  onClick={(e) => handleClick(cat, e)}
                  onMouseEnter={() => handleMouseEnter(cat)}
                  aria-expanded={active?.id === cat.id}
                >
                  {cat.name}
                </a>
              </li>
            ))}
          </ul>

          {/* DESKTOP DROPDOWN */}
          {!isMobile && active && (
            <div className={cls.panel} role="dialog" aria-modal="true">
              <div className={cls.panel__content}>
                {showCloseButton && (
                  <button
                    className={cls["panel__content--close"]}
                    onClick={() => select(null)}
                    aria-label="Close"
                  >
                    <CloseIcon />
                  </button>
                )}

                {/* Заголовок = активный корень */}
                <h2 className={cls.panelTitle}>{active.name}</h2>

                {/* 🔥 Группы: L2 как маленький тайтл, под ним список L3 */}
                <div className={cls.groupsGrid}>
                  {level2.map((l2) => {
                    const l3 = level3ByL2.get(l2.id) ?? [];
                    return (
                      <div key={l2.id} className={cls.group}>
                        <button
                          className={cls.groupTitle}
                          onClick={() => nav(`/category${l2.fullSlug}`)}
                          type="button"
                        >
                          {l2.name}
                        </button>
                        {l3.length > 0 && (
                          <ul className={cls.groupList}>
                            {l3.map((leaf) => (
                              <li key={leaf.id} className={cls.groupItem}>
                                <a onClick={() => nav(`/category${leaf.fullSlug}`)}>
                                  {leaf.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>

                {children}
              </div>
            </div>
          )}

          {/* MOBILE DRAWER (3 экрана) */}
          {isMobile && (
            <Modal
              isOpen={drawerOpen}
              onClose={closeDrawer}
              variant="left"
              sideWidth={300}
              headerBorder={false}
              header={<Logo size={26} />}
              className={cls.mobileDrawer}
            >
              {/* SCREEN L1: ROOTS */}
              <div className={screenClass("L1")}>
                <ul className={cls.mobileCategories}>
                  {roots.map((cat) => (
                    <li key={cat.id}>
                      <button
                        className={cls.mobileCatBtn}
                        onClick={() => openL2(cat)}
                        aria-label={`Open ${cat.name}`}
                      >
                        {cat.name}
                        <ChevronRightIcon className={cls.mobileChevron} />
                      </button>
                    </li>
                  ))}
                </ul>

                <div className={cls.mobileFooter}>
                  <a>Help</a>
                  <a>Contact Us</a>
                </div>

                <div className={cls.themeSwitch}>
                  <button
                    className={cls.switchBtn}
                    onClick={() => setTheme("light")}
                    aria-label="Light theme"
                  >
                    <SunIcon />
                  </button>
                  <button
                    className={cls.switchBtn}
                    onClick={() => setTheme("dark")}
                    aria-label="Dark theme"
                  >
                    <MoonIcon />
                  </button>
                </div>

                <div className={cls.languageSwitch}>
                  <span>Language:</span>
                  <a href="/en" className={cls.languageLink}>
                    English
                  </a>
                </div>
              </div>

              {/* SCREEN L2: subcats of selected root */}
              <div
                className={screenClass("L2")}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                <button className={cls.backBtn} onClick={back} aria-label="Back to roots">
                  <ChevronLeftIcon /> Back
                </button>

                {rootCat && (
                  <>
                    <h2 className={cls.panelTitle}>{rootCat.name}</h2>

                    <ul className={cls.mobileCategories}>
                      {l2List.map((l2) => (
                        <li key={l2.id}>
                          <button
                            className={cls.mobileCatBtn}
                            onClick={() => openL3(l2)}
                            aria-label={`Open ${l2.name}`}
                          >
                            {l2.name}
                            <ChevronRightIcon className={cls.mobileChevron} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* SCREEN L3: leafs of selected L2 */}
              <div
                className={screenClass("L3")}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                <button className={cls.backBtn} onClick={back} aria-label="Back to subcategories">
                  <ChevronLeftIcon /> Back
                </button>

                {l2Cat && (
                  <>
                    <h2 className={cls.panelTitle}>{l2Cat.name}</h2>

                    <ul className={cls.groupList}>
                      {l3List.map((leaf) => (
                        <li key={leaf.id} className={cls.groupItem}>
                          <a
                            onClick={() => {
                              closeDrawer();
                              nav(`/category${leaf.fullSlug}`);
                            }}
                          >
                            {leaf.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </Modal>
          )}
        </nav>
      </div>
    </>
  );
}

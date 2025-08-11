// Catalog.tsx – desktop dropdown + mobile drawer (обновлено "категории → товары" свайп)
import React, { useState, useCallback, useMemo, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import type { Category as Cat } from "../../types/category";
import { getRootCategories, getChildren } from "../../services/categoryService";

import cls from "./Catalog.module.scss";
import CloseIcon from "../Icons/CloseIcon";
import HamburgerIcon from "../Icons/HamburgerIcon";
import Modal from "../Modal/Modal";
import ChevronRightIcon from "../Icons/ChevronRightIcon";
import ChevronLeftIcon from "../Icons/ChevronLeftIcon";
import Logo from "../logo/Logo";

import { createPortal } from "react-dom";
import SunIcon from "../Icons/SunIcon";
import MoonIcon from "../Icons/MoonIcon";

function Overlay({ visible, onClick }: { visible: boolean; onClick?: () => void }) {
  return createPortal(
    <div className={`${cls.overlay} ${visible ? cls.overlayVisible : ""}`} onClick={onClick} aria-hidden={!visible} />,
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
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // 🔥 РУТЫ каталога (у тебя это минимум "Электроника")
  const roots = useMemo(() => getRootCategories(), []);

  // активный корень (desktop)
  const initialActive = useMemo<Cat | null>(() => {
    if (initialActiveId) return roots.find(r => r.id === initialActiveId) ?? null;
    return null;
  }, [initialActiveId, roots]);
  const [active, setActive] = useState<Cat | null>(initialActive);

  const select = useCallback((cat: Cat | null) => {
    setActive(cat);
    onSelect?.(cat ? cat.id : null);
  }, [onSelect]);

  const toggle = useCallback((cat: Cat) => select(active?.id === cat.id ? null : cat), [active, select]);

  // mobile drawer
  const [internalOpen, setInternalOpen] = useState(false);
  const drawerOpen = mobileDrawerOpen ?? internalOpen;
  const setDrawerOpen = (open: boolean) => onMobileDrawerOpenChange ? onMobileDrawerOpenChange(open) : setInternalOpen(open);
  const [drawerCat, setDrawerCat] = useState<Cat | null>(null);
  const [mobileStage, setMobileStage] = useState<"categories" | "items">("categories");

  useEffect(() => {
    if (!drawerOpen) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [drawerOpen]);

  const handleClick = useCallback((cat: Cat, e: React.MouseEvent<HTMLAnchorElement>) => {
    if (trigger !== "click") return;
    e.preventDefault();
    toggle(cat);
  }, [trigger, toggle]);

  const handleMouseEnter = useCallback((cat: Cat) => trigger === "hover" && select(cat), [trigger, select]);
  const handleMouseLeave = () => trigger === "hover" && select(null);

  // mobile
  const openItems = (cat: Cat) => { setDrawerCat(cat); setMobileStage("items"); };
  const backToCats = () => setMobileStage("categories");
  const closeDrawer = () => { setDrawerOpen(false); setMobileStage("categories"); setDrawerCat(null); };

  const overlayVisible = (trigger === "hover" && (isHover || !!active)) || (trigger === "click" && !!active);

  // тема (как было)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = (localStorage.getItem('theme') as 'light' | 'dark' | null);
    if (saved) return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 🔥 L2/L3 для активного корня (desktop)
  const level2 = useMemo(() => active ? getChildren(active.id) : [], [active]);
  const level3ByL2 = useMemo(() => {
    const map = new Map<string, Cat[]>();
    level2.forEach(l2 => map.set(l2.id, getChildren(l2.id)));
    return map;
  }, [level2]);

  return (
    <>
      <Overlay
        visible={overlayVisible && !isMobile}
        onClick={() => { if (trigger === "click") select(null); }}
      />

      <div
        className={`${cls.catalogContainer} ${active ? cls.isOpen : ""} ${isHover ? cls.isHover : ""}`}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      >
        <nav className={`${cls.catalog} ${className}`} onMouseLeave={handleMouseLeave}>
          {/* MOBILE HAMBURGER */}
          {isMobile && renderMobileHamburger && (
            <button className={cls.hamburger} aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
              <HamburgerIcon />
            </button>
          )}

          {/* DESKTOP NAV: корневые категории */}
          <ul className={cls.categories} aria-label="Catalog navigation">
            {roots.map((cat) => (
              <li key={cat.id} className={cls.categoryItem}>
                <a
                  href={`/category${cat.fullSlug}`}
                  className={active?.id === cat.id ? `${cls.categoryLink} ${cls.categoryLinkActive}` : cls.categoryLink}
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
                  <button className={cls["panel__content--close"]} onClick={() => select(null)} aria-label="Close">
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
                                <a onClick={() => nav(`/category${leaf.fullSlug}`)}>{leaf.name}</a>
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

          {/* MOBILE DRAWER */}
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
              {/* SCREEN: ROOTS */}
              <div className={mobileStage === "categories" ? cls.screenActive : cls.screenHiddenLeft}>
                <ul className={cls.mobileCategories}>
                  {roots.map((cat) => (
                    <li key={cat.id} className={cls.mobileCategoryItem}>
                      <button className={cls.mobileCatBtn} onClick={() => openItems(cat)}>
                        {cat.name}
                        <ChevronLeftIcon className={cls.mobileChevron} />
                      </button>
                    </li>
                  ))}
                </ul>

                <div className={cls.mobileFooter}>
                  <a>Help</a>
                  <a>Contact Us</a>
                </div>

                <div className={cls.themeSwitch}>
                  <button className={cls.switchBtn} onClick={() => setTheme('light')}><SunIcon /></button>
                  <button className={cls.switchBtn} onClick={() => setTheme('dark')}><MoonIcon /></button>
                </div>

                <div className={cls.languageSwitch}>
                  <span>Language:</span>
                  <a href="/en" className={cls.languageLink}>English</a>
                </div>
              </div>

              {/* SCREEN: L2 + L3 для выбранного рута */}
              <div className={mobileStage === "items" ? cls.screenActive : cls.screenHiddenRight}>
                <button className={cls.backBtn} onClick={backToCats} aria-label="Back">
                  <ChevronRightIcon /> Back
                </button>

                {drawerCat && (
                  <>
                    <h2 className={cls.panelTitle}>{drawerCat.name}</h2>

                    <div className={cls.mobileGroups}>
                      {getChildren(drawerCat.id).map((l2) => {
                        const l3 = getChildren(l2.id);
                        return (
                          <div key={l2.id} className={cls.group}>
                            <button
                              className={cls.groupTitle}
                              onClick={() => { closeDrawer(); nav(`/category${l2.fullSlug}`); }}
                              type="button"
                            >
                              {l2.name}
                            </button>
                            {l3.length > 0 && (
                              <ul className={cls.groupList}>
                                {l3.map((leaf) => (
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
                            )}
                          </div>
                        );
                      })}
                    </div>
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

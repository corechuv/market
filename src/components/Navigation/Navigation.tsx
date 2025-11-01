// src/components/Navigation/Navigation.tsx
import { useMemo, useRef, useState, useEffect } from "react";
import cls from "./Navigation.module.scss";
import AccountIcon from "../Icons/AccountIcon";
import SearchIcon from "../Icons/SearchIcon";
import { useNavigate } from "react-router-dom";
import BagIcon from "../Icons/BagIcon";
import CounterBadge from "../Common/CounterBadge/CounterBadge";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import PlayIcon from "../Icons/PlayIcon";
import SearchPanel from "./Panel/SearchPanel";
import SettingsIcon from "../Icons/SettingsIcon";
import SettingsPanel from "./Panel/SettingsPanel";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";

export interface Props {
  className?: string;
  hideOnMobile?: boolean;
}

type PanelId = "search" | "settings";

type BaseItem = {
  id: string;
  ariaLabel: string;
  icon: React.ReactNode;
  disabled?: boolean;
  renderAfterIcon?: React.ReactNode;
  align?: "top" | "bottom";       // куда положить кнопку
  controlsId?: string;            // id панели для aria-controls
};

type NavItem =
  | (BaseItem & { action: "panel"; panel: PanelId })
  | (BaseItem & { action: "link"; to: string });

const Navigation: React.FC<Props> = ({ className, hideOnMobile }) => {
  const nav = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { lines } = useCart();

  const cartCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines]
  );

  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  useLockBodyScroll(Boolean(activePanel));

  // закрыть по клику вне
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setActivePanel(null);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, []);

  const items: NavItem[] = [
    {
      id: "logo",
      ariaLabel: "Home",
      icon: <div className={cls.logo}>d</div>,
      action: "link",
      to: "/",
      align: "top",
    },
    {
      id: "search",
      ariaLabel: "Search",
      icon: <SearchIcon width={24} />,
      action: "panel",
      panel: "search",
      controlsId: "search-panel",
      align: "top",
    },
    {
      id: "videos",
      ariaLabel: "Video feed",
      icon: <PlayIcon />,
      action: "link",
      to: "/videos?sort=trending",
      align: "top",
    },
    {
      id: "account",
      ariaLabel: isAuthenticated ? "Profile" : "Login",
      icon: <AccountIcon />,
      action: "link",
      to: isAuthenticated ? "/account" : "/auth",
      disabled: authLoading,
      align: "top",
    },
    {
      id: "cart",
      ariaLabel: "Cart",
      icon: <BagIcon />,
      action: "link",
      to: "/checkout",
      renderAfterIcon: (
        <CounterBadge count={cartCount} title={`In cart: ${cartCount}`} />
      ),
      align: "top",
    },
    // Settings — такой же item, рендерится внизу
    {
      id: "settings",
      ariaLabel: "Settings",
      icon: <SettingsIcon />,
      action: "panel",
      panel: "settings",
      controlsId: "settings-panel",
      align: "bottom",
    },
  ];

  // единый обработчик
  const onItemClick = (item: NavItem) => {
    if (item.disabled) return;
    if (item.action === "link") {
      setActivePanel(null);
      nav(item.to);
      return;
    }
    setActivePanel(prev => (prev === item.panel ? null : item.panel));
  };

  const renderGroup = (where: "top" | "bottom") => (
    <div className={cls.nav__container}>
      {items
        .filter(i => (i.align ?? "top") === where)
        .map(item => (
          <button
            key={item.id}
            className={cls["nav__container--btn"]}
            aria-label={item.ariaLabel}
            onClick={() => onItemClick(item)}
            disabled={item.disabled}
            data-active={
              item.action === "panel" && activePanel === item.panel ? true : undefined
            }
            aria-expanded={
              item.action === "panel" ? activePanel === item.panel : undefined
            }
            aria-controls={
              item.action === "panel" ? item.controlsId : undefined
            }
          >
            {item.icon}
            {item.renderAfterIcon}
          </button>
        ))}
    </div>
  );

  const closePanels = () => setActivePanel(null);

  return (
    <div
      className={cls.f}
      ref={wrapperRef}
      data-has-open={activePanel ? true : undefined}   // для затемнения фона
      data-hide-mobile={hideOnMobile ? true : undefined}  // ← добавили
    >
      <nav className={`${cls.nav} ${className || ""}`}>
        {renderGroup("top")}
        {renderGroup("bottom")}
      </nav>

      <section
        className={cls.f__main}
        data-open={activePanel ? true : undefined}
        aria-hidden={!activePanel}
        // закрытие по Esc
        onKeyDown={(e) => {
          if (e.key === "Escape") closePanels();
        }}
        tabIndex={-1}
      >
        <div className={cls.f__container}>
          {activePanel === "search" && (
            <SearchPanel open onClose={closePanels} anchorRole="search" />
          )}
          {activePanel === "settings" && (
            <SettingsPanel open onClose={closePanels} anchorRole="settings" />
          )}
        </div>
      </section>
    </div>
  );
};

export default Navigation;

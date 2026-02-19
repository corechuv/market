// src/components/Navigation/Navigation.tsx
import {
  useMemo,
  useRef,
  useState,
  useEffect,
  type ReactNode,
  type FC,
} from "react";
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
import CatalogPanel from "./Panel/CatalogPanel";
import NotificationsPanel from "./Panel/NotificationsPanel";
import NotificationIcon from "../Icons/NotificationIcon";
import HamburgerIcon from "../Icons/HamburgerIcon";
import { buildAvatarSrc } from "../../utils/avatar";
import { NAV_OPEN_SETTINGS } from "../../utils/navEvents";
import { NotificationsApi } from "../../services/notificationsApi";
import { useLang } from "../../context/LangContext";

export interface Props {
  className?: string;
  hideOnMobile?: boolean;
}

type PanelId = "search" | "catalog" | "settings" | "notifications";

type BaseItem = {
  id: string;
  ariaLabel: string;
  icon: ReactNode;
  disabled?: boolean;
  renderAfterIcon?: ReactNode;
  align?: "top" | "bottom"; // куда положить кнопку
  controlsId?: string; // id панели для aria-controls
};

type NavItem =
  | (BaseItem & { action: "panel"; panel: PanelId })
  | (BaseItem & { action: "link"; to: string });

const Navigation: FC<Props> = ({ className, hideOnMobile }) => {
  const nav = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const { lines } = useCart();

  const username = useMemo(() => {
    const uname = (user as any)?.username;
    return uname ? String(uname).trim().toLowerCase() : "";
  }, [user]);

  const cartCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines]
  );

  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const onOpenSettings = () => setActivePanel("settings");
    window.addEventListener(NAV_OPEN_SETTINGS, onOpenSettings as EventListener);
    return () => {
      window.removeEventListener(NAV_OPEN_SETTINGS, onOpenSettings as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadNotifications(0);
      return;
    }

    let alive = true;
    let stopStream = () => {};
    let lastEventId: string | null = null;

    const refreshUnread = async () => {
      try {
        const data = await NotificationsApi.unreadCount();
        if (alive) setUnreadNotifications(data.unreadCount);
      } catch {
        // keep previous value
      }
    };

    void refreshUnread();

    const pollId = window.setInterval(() => {
      void refreshUnread();
    }, 60_000);

    void (async () => {
      try {
        const { token } = await NotificationsApi.createStreamToken();
        if (!alive) return;

        stopStream = NotificationsApi.openStream({
          token,
          lastEventId: lastEventId ?? undefined,
          onEvent: (event, incomingLastEventId) => {
            if (incomingLastEventId) lastEventId = incomingLastEventId;

            switch (event.type) {
              case "notification.unread_count":
                setUnreadNotifications(event.unreadCount);
                break;
              case "notification.created":
                setUnreadNotifications((prev) =>
                  event.notification.isRead ? prev : prev + 1,
                );
                break;
              case "notification.updated":
                if (event.isRead) {
                  setUnreadNotifications((prev) => Math.max(prev - 1, 0));
                }
                break;
              case "notification.deleted":
              case "keepalive":
                break;
            }
          },
          onError: () => {
            // polling remains as fallback
          },
        });
      } catch {
        // polling remains as fallback
      }
    })();

    return () => {
      alive = false;
      window.clearInterval(pollId);
      stopStream();
    };
  }, [isAuthenticated]);

  const lastSyncedLocaleRef = useRef<string | null>(null);
  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      lastSyncedLocaleRef.current = null;
      return;
    }
    if (lastSyncedLocaleRef.current === lang) return;

    lastSyncedLocaleRef.current = lang;
    void NotificationsApi.updatePreferences({ locale: lang }).catch(() => {
      if (lastSyncedLocaleRef.current === lang) {
        lastSyncedLocaleRef.current = null;
      }
    });
  }, [authLoading, isAuthenticated, lang]);

  // абсолютный URL аватара + cache-buster по updatedAt
  const avatarSrc = useMemo(
    () => buildAvatarSrc(user?.avatarUrl, user?.updatedAt),
    [user?.avatarUrl, user?.updatedAt]
  );

  const [avatarBroken, setAvatarBroken] = useState(false);

  // если src поменялся (новый аватар) — сбрасываем флаг поломки
  useEffect(() => {
    setAvatarBroken(false);
  }, [avatarSrc]);

  // закрыть панели по клику вне
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
      id: "catalog",
      ariaLabel: "Catalog",
      icon: <HamburgerIcon width={24} />,
      action: "panel",
      panel: "catalog",
      controlsId: "catalog-panel",
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
      icon: isAuthenticated && avatarSrc && !avatarBroken ? (
        <img
          src={avatarSrc}
          alt="Avatar"
          width={24}
          height={24}
          loading="lazy"
          decoding="async"
          onError={() => setAvatarBroken(true)}
        />
      ) : isAuthenticated ? (
        <div className={cls.placeholder} aria-hidden />
      ) : (
        <AccountIcon />
      ),
      action: "link",
      to: isAuthenticated
        ? username
          ? `/u/${username}/videos`
          : "/account"
        : "/auth",
      disabled: authLoading,
      align: "top",
    },
    {
      id: "cart",
      ariaLabel: "Cart",
      icon: <BagIcon />,
      action: "link",
      to: "/cart",
      renderAfterIcon: (
        <CounterBadge count={cartCount} title={`In cart: ${cartCount}`} />
      ),
      align: "top",
    },
    {
      id: "notifications",
      ariaLabel: "Notifications",
      icon: <NotificationIcon width={24} />,
      action: "panel",
      panel: "notifications",
      controlsId: "notifications-panel",
      renderAfterIcon: (
        <CounterBadge
          count={unreadNotifications}
          title={`Unread notifications: ${unreadNotifications}`}
        />
      ),
      align: "top",
    },
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

  const onItemClick = (item: NavItem) => {
    if (item.disabled) return;
    if (item.action === "link") {
      setActivePanel(null);
      if (item.to) nav(item.to);
      return;
    }
    setActivePanel((prev) => (prev === item.panel ? null : item.panel));
  };

  const renderGroup = (where: "top" | "bottom") => (
    <div className={cls.nav__container}>
      {items
        .filter((i) => (i.align ?? "top") === where)
        .map((item) => (
          <button
            key={item.id}
            className={cls["nav__container--btn"]}
            aria-label={item.ariaLabel}
            onClick={() => onItemClick(item)}
            disabled={item.disabled}
            data-active={
              item.action === "panel" && activePanel === item.panel
                ? true
                : undefined
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
      data-has-open={activePanel ? true : undefined}
      data-hide-mobile={hideOnMobile ? true : undefined}
    >
      <nav className={`${cls.nav} ${className || ""}`}>
        {renderGroup("top")}
        {renderGroup("bottom")}
      </nav>

      <section
        className={cls.f__main}
        data-open={activePanel ? true : undefined}
        aria-hidden={!activePanel}
        onKeyDown={(e) => {
          if (e.key === "Escape") closePanels();
        }}
        tabIndex={-1}
      >
        <div className={cls.f__container}>
          {activePanel === "search" && (
            <SearchPanel open onClose={closePanels} anchorRole="search" />
          )}
          {activePanel === "catalog" && (
            <CatalogPanel open onClose={closePanels} anchorRole="catalog" />
          )}
          {activePanel === "settings" && (
            <SettingsPanel open onClose={closePanels} anchorRole="settings" />
          )}
          {activePanel === "notifications" && (
            <NotificationsPanel
              open
              onClose={closePanels}
              anchorRole="notifications"
              onUnreadCountChange={setUnreadNotifications}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default Navigation;

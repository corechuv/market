import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import c from "./NotificationsPanel.module.scss";
import MasterBar from "../../UI/Bars/MasterBar";
import ScrollArea from "../../UI/ScrollArea/ScrollArea";
import { useAuth } from "../../../context/AuthContext";
import { useVisualViewport } from "../../../hooks/useViewportUnits";
import { NotificationsApi } from "../../../services/notificationsApi";
import type { NotificationItem } from "../../../types/notification";
import { useTranslation } from "react-i18next";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  anchorRole?: "notifications";
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onUnreadCountChange?: React.Dispatch<React.SetStateAction<number>>;
}

const PAGE_SIZE = 20;

function mergeNotifications(
  current: NotificationItem[],
  incoming: NotificationItem[],
): NotificationItem[] {
  const map = new Map<string, NotificationItem>();

  current.forEach((item) => {
    map.set(item.id, item);
  });

  incoming.forEach((item) => {
    const prev = map.get(item.id);
    map.set(item.id, prev ? { ...prev, ...item } : item);
  });

  return Array.from(map.values());
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  open,
  onClose,
  anchorRole = "notifications",
  onMouseEnter,
  onMouseLeave,
  onUnreadCountChange,
}) => {
  useVisualViewport();

  const { t } = useTranslation("notifications");
  const nav = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [items, setItems] = useState<NotificationItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [markAllBusy, setMarkAllBusy] = useState(false);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [],
  );

  const formatCreatedAt = useCallback(
    (value: string) => {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return value;
      return dateFormatter.format(d);
    },
    [dateFormatter],
  );

  const rememberBusyId = useCallback((id: string) => {
    setBusyIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const forgetBusyId = useCallback((id: string) => {
    setBusyIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const loadFirstPage = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setNextCursor(null);
      setLoadError(null);
      onUnreadCountChange?.(0);
      return;
    }

    setLoading(true);
    setLoadError(null);
    setActionError(null);

    try {
      const data = await NotificationsApi.list({ limit: PAGE_SIZE });
      setItems(data.items);
      setNextCursor(data.nextCursor);
      onUnreadCountChange?.(data.unreadCount);
      setLoadError(null);
    } catch {
      setLoadError(t("states.loadError"));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, onUnreadCountChange, t]);

  useEffect(() => {
    if (!open) return;
    void loadFirstPage();
  }, [open, loadFirstPage]);

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || loadingMore || !isAuthenticated) return;

    setLoadingMore(true);
    try {
      const data = await NotificationsApi.list({
        limit: PAGE_SIZE,
        cursor: nextCursor,
      });
      setItems((prev) => mergeNotifications(prev, data.items));
      setNextCursor(data.nextCursor);
      onUnreadCountChange?.(data.unreadCount);
      setActionError(null);
    } catch {
      if (items.length === 0) setLoadError(t("states.loadError"));
      else setActionError(t("states.loadError"));
    } finally {
      setLoadingMore(false);
    }
  }, [isAuthenticated, items.length, loadingMore, nextCursor, onUnreadCountChange, t]);

  const markOneAsRead = useCallback(
    async (item: NotificationItem) => {
      if (item.isRead) return;

      rememberBusyId(item.id);
      try {
        await NotificationsApi.markRead(item.id);
        setItems((prev) =>
          prev.map((x) =>
            x.id === item.id
              ? {
                  ...x,
                  isRead: true,
                  readAt: x.readAt ?? new Date().toISOString(),
                }
              : x,
          ),
        );
        onUnreadCountChange?.((prev) => Math.max(prev - 1, 0));
        setActionError(null);
      } catch {
        setActionError(t("states.markReadError"));
      } finally {
        forgetBusyId(item.id);
      }
    },
    [forgetBusyId, onUnreadCountChange, rememberBusyId, t],
  );

  const handleMarkAllRead = useCallback(async () => {
    if (!items.some((item) => !item.isRead) || markAllBusy) return;

    setMarkAllBusy(true);
    try {
      const data = await NotificationsApi.markReadBulk({ mode: "all" });
      setItems((prev) =>
        prev.map((item) => {
          if (item.isRead) return item;
          return { ...item, isRead: true, readAt: new Date().toISOString() };
        }),
      );
      onUnreadCountChange?.(data.unreadCount);
      setActionError(null);
    } catch {
      setActionError(t("states.markReadError"));
    } finally {
      setMarkAllBusy(false);
    }
  }, [items, markAllBusy, onUnreadCountChange, t]);

  const handleOpenItem = useCallback(
    async (item: NotificationItem) => {
      if (!item.isRead) {
        await markOneAsRead(item);
      }

      const href = item.action?.href;
      if (!href) return;

      onClose();
      nav(href);
    },
    [markOneAsRead, nav, onClose],
  );

  if (!open) return null;

  return (
    <section
      id="notifications-panel"
      role="region"
      aria-label={t("panel.ariaLabel")}
      data-panel="notifications"
      data-anchor={anchorRole}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={c.g}
    >
      <div className={c.content}>
        <MasterBar title={t("panel.title")} background="var(--n-bg-desktop)" />

        <ScrollArea lockBody={false}>
          <div className={c.toolbar}>
            <button
              type="button"
              className={c.toolbar__btn}
              onClick={() => {
                void handleMarkAllRead();
              }}
              disabled={markAllBusy || !items.some((item) => !item.isRead)}
            >
              {markAllBusy ? t("actions.marking") : t("actions.markAllRead")}
            </button>
          </div>

          {!authLoading && isAuthenticated && actionError && (
            <p className={c.errorInline}>{actionError}</p>
          )}

          {authLoading && (
            <p className={c.state} role="status" aria-live="polite">
              {t("states.authLoading")}
            </p>
          )}

          {!authLoading && !isAuthenticated && (
            <div className={c.stateWrap}>
              <p className={c.state}>{t("states.requireAuth")}</p>
              <button
                type="button"
                className={c.actionBtn}
                onClick={() => {
                  onClose();
                  nav("/auth");
                }}
              >
                {t("actions.goToAuth")}
              </button>
            </div>
          )}

          {!authLoading && isAuthenticated && loading && (
            <p className={c.state} role="status" aria-live="polite">
              {t("states.loading")}
            </p>
          )}

          {!authLoading &&
            isAuthenticated &&
            !loading &&
            loadError &&
            items.length === 0 && (
            <div className={c.stateWrap}>
              <p className={c.error}>{loadError}</p>
              <button
                type="button"
                className={c.actionBtn}
                onClick={() => {
                  void loadFirstPage();
                }}
              >
                {t("actions.retry")}
              </button>
            </div>
            )}

          {!authLoading &&
            isAuthenticated &&
            !loading &&
            !loadError &&
            items.length === 0 && <p className={c.state}>{t("states.empty")}</p>}

          {!authLoading && isAuthenticated && !loading && !loadError && items.length > 0 && (
            <ul className={c.list}>
              {items.map((item) => {
                const isBusy = busyIds.includes(item.id);

                return (
                  <li
                    key={item.id}
                    className={`${c.list__item} ${!item.isRead ? c.unread : ""}`}
                    onClick={() => {
                      void handleOpenItem(item);
                    }}
                    aria-busy={isBusy}
                  >
                    <div className={c.row}>
                      <p className={c.title}>{item.title}</p>
                      {!item.isRead && <span className={c.dot} aria-hidden />}
                    </div>

                    <p className={c.body}>{item.body}</p>

                    <div className={c.meta}>
                      <span className={c.time}>{formatCreatedAt(item.createdAt)}</span>
                      {isBusy && <span className={c.pending}>{t("states.markingOne")}</span>}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {!authLoading &&
            isAuthenticated &&
            !loading &&
            !loadError &&
            !!nextCursor && (
              <div className={c.loadMoreWrap}>
                <button
                  type="button"
                  className={c.actionBtn}
                  onClick={() => {
                    void handleLoadMore();
                  }}
                  disabled={loadingMore}
                >
                  {loadingMore ? t("actions.loadingMore") : t("actions.loadMore")}
                </button>
              </div>
            )}
        </ScrollArea>
      </div>
    </section>
  );
};

export default NotificationsPanel;

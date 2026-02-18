import api from "../lib/api";
import type {
  MarkNotificationsReadRequest,
  MarkNotificationsReadResponse,
  NotificationItem,
  NotificationListParams,
  NotificationListResponse,
  NotificationPreferences,
  NotificationStreamEvent,
  NotificationStreamOptions,
  NotificationStreamTokenResponse,
  UnreadCountResponse,
  UpdateNotificationPreferencesRequest,
} from "../types/notification";

const LIST_LIMIT_DEFAULT = 20;
const LIST_LIMIT_MAX = 100;

function normalizeBaseUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function clampListLimit(value?: number): number {
  if (!value || Number.isNaN(value)) return LIST_LIMIT_DEFAULT;
  return Math.min(Math.max(Math.trunc(value), 1), LIST_LIMIT_MAX);
}

function buildListQuery(params: NotificationListParams = {}): string {
  const q = new URLSearchParams();

  q.set("limit", String(clampListLimit(params.limit)));

  if (params.cursor) q.set("cursor", params.cursor);
  if (params.unreadOnly) q.set("unreadOnly", "true");
  if (params.category) q.set("category", params.category);
  if (params.priority) q.set("priority", params.priority);

  if (params.types?.length) {
    params.types.forEach((type) => {
      if (type) q.append("type", type);
    });
  }

  return q.toString();
}

function buildStreamUrl(token: string, lastEventId?: string): string {
  const q = new URLSearchParams({ token });
  if (lastEventId) q.set("lastEventId", lastEventId);

  const base = normalizeBaseUrl(api.defaults.baseURL);
  return `${base}/notifications/stream?${q.toString()}`;
}

function toError(value: unknown, fallbackMessage: string): Error {
  if (value instanceof Error) return value;
  return new Error(fallbackMessage);
}

export async function listNotifications(
  params: NotificationListParams = {},
): Promise<NotificationListResponse> {
  const query = buildListQuery(params);
  const { data } = await api.get<NotificationListResponse>(
    `/notifications/my?${query}`,
  );
  return data;
}

export async function getUnreadNotificationsCount(): Promise<UnreadCountResponse> {
  const { data } = await api.get<UnreadCountResponse>(
    "/notifications/my/unread-count",
  );
  return data;
}

export async function markNotificationRead(id: string): Promise<NotificationItem> {
  const safeId = encodeURIComponent(id);
  const { data } = await api.patch<NotificationItem>(
    `/notifications/${safeId}/read`,
    {},
  );
  return data;
}

export async function markNotificationsRead(
  payload: MarkNotificationsReadRequest,
): Promise<MarkNotificationsReadResponse> {
  const { data } = await api.post<MarkNotificationsReadResponse>(
    "/notifications/my/read",
    payload,
  );
  return data;
}

export async function archiveNotification(id: string): Promise<void> {
  const safeId = encodeURIComponent(id);
  await api.delete(`/notifications/${safeId}`);
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const { data } = await api.get<NotificationPreferences>(
    "/notifications/preferences/my",
  );
  return data;
}

export async function updateNotificationPreferences(
  payload: UpdateNotificationPreferencesRequest,
): Promise<NotificationPreferences> {
  const { data } = await api.put<NotificationPreferences>(
    "/notifications/preferences/my",
    payload,
  );
  return data;
}

export async function createNotificationStreamToken(): Promise<NotificationStreamTokenResponse> {
  const { data } = await api.post<NotificationStreamTokenResponse>(
    "/notifications/stream-token",
    {},
  );
  return data;
}

export function openNotificationsStream(
  options: NotificationStreamOptions,
): () => void {
  const streamUrl = buildStreamUrl(options.token, options.lastEventId);

  const source = new EventSource(streamUrl, {
    withCredentials: options.withCredentials ?? true,
  });

  source.onopen = () => {
    options.onOpen?.();
  };

  source.onmessage = (rawEvent: MessageEvent<string>) => {
    if (!rawEvent.data) return;

    try {
      const event = JSON.parse(rawEvent.data) as NotificationStreamEvent;
      options.onEvent(event, rawEvent.lastEventId || null);
    } catch (error: unknown) {
      options.onError?.(
        toError(error, "Failed to parse notification stream message"),
      );
    }
  };

  source.onerror = () => {
    options.onError?.(new Error("Notification stream disconnected"));
  };

  return () => {
    source.close();
  };
}

export const NotificationsApi = {
  list: listNotifications,
  unreadCount: getUnreadNotificationsCount,
  markRead: markNotificationRead,
  markReadBulk: markNotificationsRead,
  archive: archiveNotification,
  getPreferences: getNotificationPreferences,
  updatePreferences: updateNotificationPreferences,
  createStreamToken: createNotificationStreamToken,
  openStream: openNotificationsStream,
};

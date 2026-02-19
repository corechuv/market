export type NotificationChannel = "in_app" | "email" | "push" | "sms";
export type NotificationLanguageCode = "en" | "ru" | "de" | (string & {});

export type NotificationPriority = "low" | "normal" | "high" | "critical";

export type NotificationDeliveryStatus =
  | "pending"
  | "scheduled"
  | "sent"
  | "delivered"
  | "failed"
  | "skipped";

export type NotificationTopic =
  | "order_updates"
  | "payments"
  | "shipping"
  | "returns"
  | "security"
  | "support"
  | "marketing";

export type NotificationAction = {
  label: string;
  href: string;
  method?: "GET" | "POST";
};

export type NotificationItem = {
  id: string;
  userId: string;
  type: string;
  category: string;
  title: string;
  body: string;
  lang: NotificationLanguageCode;
  priority: NotificationPriority;
  payload: Record<string, unknown>;
  action?: NotificationAction | null;
  imageUrl?: string | null;
  channels: NotificationChannel[];
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  expiresAt: string | null;
};

export type NotificationListParams = {
  limit?: number;
  cursor?: string;
  unreadOnly?: boolean;
  category?: string;
  priority?: NotificationPriority;
  types?: string[];
};

export type NotificationListResponse = {
  items: NotificationItem[];
  nextCursor: string | null;
  unreadCount: number;
  serverTime: string;
};

export type UnreadCountResponse = {
  unreadCount: number;
  updatedAt: string;
};

export type MarkNotificationsReadRequest =
  | {
      mode: "ids";
      ids: string[];
      readAt?: string;
    }
  | {
      mode: "all";
      beforeCursor?: string;
      readAt?: string;
    };

export type MarkNotificationsReadResponse = {
  updated: number;
  unreadCount: number;
};

export type NotificationPreferences = {
  userId: string;
  locale: NotificationLanguageCode;
  channels: Record<NotificationChannel, boolean>;
  topics: Record<NotificationTopic, boolean>;
  quietHours: {
    enabled: boolean;
    timezone: string;
    start: string;
    end: string;
  };
  digest: {
    mode: "off" | "daily" | "weekly";
    hour: number;
    weekday: number | null;
  };
  updatedAt: string;
};

export type UpdateNotificationPreferencesRequest = {
  locale?: NotificationLanguageCode;
  channels?: Partial<Record<NotificationChannel, boolean>>;
  topics?: Partial<Record<NotificationTopic, boolean>>;
  quietHours?: Partial<NotificationPreferences["quietHours"]>;
  digest?: Partial<NotificationPreferences["digest"]>;
};

export type NotificationStreamTokenResponse = {
  token: string;
  expiresAt: string;
};

export type NotificationStreamEvent =
  | {
      type: "notification.created";
      notification: NotificationItem;
    }
  | {
      type: "notification.updated";
      notificationId: string;
      isRead: boolean;
      readAt: string | null;
    }
  | {
      type: "notification.deleted";
      notificationId: string;
    }
  | {
      type: "notification.unread_count";
      unreadCount: number;
    }
  | {
      type: "keepalive";
      ts: string;
    };

export type NotificationStreamOptions = {
  token: string;
  lastEventId?: string;
  withCredentials?: boolean;
  onOpen?: () => void;
  onEvent: (event: NotificationStreamEvent, lastEventId: string | null) => void;
  onError?: (error: Error) => void;
};

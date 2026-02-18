# Notifications Production Spec

Этот документ рассчитан на связку фронтенда `my-marketplace` и backend `my-api-server-marketplace`.

## 1) SQL Schema (PostgreSQL 15+)

```sql
-- notifications: production baseline
-- migration target: my-api-server-marketplace (db/migrations)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'push', 'sms');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE notification_delivery_status AS ENUM ('pending', 'scheduled', 'sent', 'delivered', 'failed', 'skipped');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TYPE notification_digest_mode AS ENUM ('off', 'daily', 'weekly');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS notification_outbox (
  id BIGSERIAL PRIMARY KEY,
  event_id UUID NOT NULL DEFAULT gen_random_uuid(),
  aggregate_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  dedupe_key TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_retry_at TIMESTAMPTZ,
  last_error TEXT,
  CONSTRAINT uq_notification_outbox_event_id UNIQUE (event_id),
  CONSTRAINT uq_notification_outbox_dedupe_key UNIQUE (dedupe_key)
);

CREATE INDEX IF NOT EXISTS idx_notification_outbox_pending
  ON notification_outbox (created_at, id)
  WHERE published_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notification_outbox_retry
  ON notification_outbox (next_retry_at, id)
  WHERE published_at IS NULL;

CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  source_entity TEXT NOT NULL,
  source_entity_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  category TEXT NOT NULL,
  priority notification_priority NOT NULL DEFAULT 'normal',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  action_url TEXT,
  image_url TEXT,
  lang VARCHAR(8) NOT NULL DEFAULT 'en',
  channels notification_channel[] NOT NULL DEFAULT ARRAY['in_app'::notification_channel],
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_user_notifications_read_state
    CHECK ((NOT is_read AND read_at IS NULL) OR (is_read AND read_at IS NOT NULL)),
  CONSTRAINT uq_user_notifications_idempotency UNIQUE (user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_feed
  ON user_notifications (user_id, created_at DESC, id DESC)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_notifications_unread
  ON user_notifications (user_id, created_at DESC, id DESC)
  WHERE archived_at IS NULL AND is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_user_notifications_expiry
  ON user_notifications (expires_at)
  WHERE expires_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS notification_deliveries (
  id BIGSERIAL PRIMARY KEY,
  user_notification_id UUID NOT NULL REFERENCES user_notifications(id) ON DELETE CASCADE,
  channel notification_channel NOT NULL,
  status notification_delivery_status NOT NULL DEFAULT 'pending',
  provider TEXT,
  provider_message_id TEXT,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_retry_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_notification_deliveries UNIQUE (user_notification_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_queue
  ON notification_deliveries (status, next_retry_at, id)
  WHERE status IN ('pending', 'failed');

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY,
  channels JSONB NOT NULL DEFAULT '{"in_app": true, "email": true, "push": false, "sms": false}'::jsonb,
  topics JSONB NOT NULL DEFAULT '{"order_updates": true, "payments": true, "shipping": true, "returns": true, "security": true, "support": true, "marketing": false}'::jsonb,
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  quiet_hours_start TIME NOT NULL DEFAULT '22:00',
  quiet_hours_end TIME NOT NULL DEFAULT '08:00',
  quiet_hours_timezone TEXT NOT NULL DEFAULT 'UTC',
  digest_mode notification_digest_mode NOT NULL DEFAULT 'off',
  digest_hour SMALLINT NOT NULL DEFAULT 9 CHECK (digest_hour BETWEEN 0 AND 23),
  digest_weekday SMALLINT CHECK (digest_weekday BETWEEN 0 AND 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_notification_preferences_digest_weekday
    CHECK (
      (digest_mode = 'weekly' AND digest_weekday IS NOT NULL)
      OR (digest_mode <> 'weekly' AND digest_weekday IS NULL)
    )
);

DO $$
BEGIN
  IF to_regclass('public.users') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_notifications_user_id_users'
    ) THEN
      ALTER TABLE user_notifications
        ADD CONSTRAINT fk_user_notifications_user_id_users
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'fk_notification_preferences_user_id_users'
    ) THEN
      ALTER TABLE notification_preferences
        ADD CONSTRAINT fk_notification_preferences_user_id_users
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;

  ELSIF to_regclass('public.customers') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_notifications_user_id_customers'
    ) THEN
      ALTER TABLE user_notifications
        ADD CONSTRAINT fk_user_notifications_user_id_customers
        FOREIGN KEY (user_id) REFERENCES customers(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'fk_notification_preferences_user_id_customers'
    ) THEN
      ALTER TABLE notification_preferences
        ADD CONSTRAINT fk_notification_preferences_user_id_customers
        FOREIGN KEY (user_id) REFERENCES customers(id) ON DELETE CASCADE;
    END IF;
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION set_row_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_notifications_updated_at ON user_notifications;
CREATE TRIGGER trg_user_notifications_updated_at
BEFORE UPDATE ON user_notifications
FOR EACH ROW
EXECUTE FUNCTION set_row_updated_at();

DROP TRIGGER IF EXISTS trg_notification_deliveries_updated_at ON notification_deliveries;
CREATE TRIGGER trg_notification_deliveries_updated_at
BEFORE UPDATE ON notification_deliveries
FOR EACH ROW
EXECUTE FUNCTION set_row_updated_at();

DROP TRIGGER IF EXISTS trg_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER trg_notification_preferences_updated_at
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION set_row_updated_at();

-- housekeeping job (cron/worker):
-- 1) archive expired
-- UPDATE user_notifications
-- SET archived_at = NOW()
-- WHERE expires_at IS NOT NULL AND expires_at < NOW() AND archived_at IS NULL;
--
-- 2) hard-delete old archived records (example retention 180d)
-- DELETE FROM user_notifications
-- WHERE archived_at IS NOT NULL AND archived_at < NOW() - INTERVAL '180 days';
```

## 2) API Contracts

База URL: `VITE_API_BASE_URL`  
Auth: `Authorization: Bearer <accessToken>`  
Error envelope:

```json
{
  "error": {
    "code": "notification_not_found",
    "message": "Notification was not found",
    "details": {},
    "requestId": "req_01J..."
  }
}
```

### `GET /notifications/my`
Query:
- `limit` (1..100, default `20`)
- `cursor` (opaque string, cursor pagination by `createdAt,id`)
- `unreadOnly` (`true|false`)
- `category` (optional)
- `priority` (`low|normal|high|critical`)
- `type` (repeatable query param)

Response `200`:

```json
{
  "items": [
    {
      "id": "4a3f7f9f-95ba-4d03-8cb4-37eaf49d0a5e",
      "userId": "f4d0d688-a9ea-4e42-bd5f-3d34aa5147aa",
      "type": "order.shipped",
      "category": "shipping",
      "title": "Order #100243 was shipped",
      "body": "Carrier: DHL, ETA: 2-4 days",
      "lang": "en",
      "priority": "high",
      "payload": {
        "orderId": "100243",
        "carrier": "DHL"
      },
      "action": {
        "label": "Track order",
        "href": "/account/orders/100243"
      },
      "imageUrl": null,
      "channels": ["in_app", "email"],
      "isRead": false,
      "readAt": null,
      "createdAt": "2026-02-18T11:10:55.120Z",
      "expiresAt": null
    }
  ],
  "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI2LTAyLTE4VDExOjEwOjU1LjEyMFoiLCJpZCI6IjRhM2Y3ZjlmLTk1YmEtNGQwMy04Y2I0LTM3ZWFmNDlkMGE1ZSJ9",
  "unreadCount": 12,
  "serverTime": "2026-02-18T11:12:10.331Z"
}
```

### `GET /notifications/my/unread-count`
Response `200`:

```json
{
  "unreadCount": 12,
  "updatedAt": "2026-02-18T11:12:10.331Z"
}
```

### `PATCH /notifications/{notificationId}/read`
Response `200`: обновлённый объект уведомления.

### `POST /notifications/my/read`
Request (variant 1):

```json
{
  "mode": "ids",
  "ids": ["4a3f7f9f-95ba-4d03-8cb4-37eaf49d0a5e"],
  "readAt": "2026-02-18T11:15:00.000Z"
}
```

Request (variant 2):

```json
{
  "mode": "all",
  "beforeCursor": "eyJjcmVhdGVkQXQiOiIyMDI2LTAyLTE4VDExOjEwOjU1LjEyMFoiLCJpZCI6IjRhM2Y3ZjlmLTk1YmEtNGQwMy04Y2I0LTM3ZWFmNDlkMGE1ZSJ9"
}
```

Response `200`:

```json
{
  "updated": 12,
  "unreadCount": 0
}
```

### `DELETE /notifications/{notificationId}`
Soft delete (archive). Response `204`.

### `GET /notifications/preferences/my`
Response `200`:

```json
{
  "userId": "f4d0d688-a9ea-4e42-bd5f-3d34aa5147aa",
  "channels": {
    "in_app": true,
    "email": true,
    "push": false,
    "sms": false
  },
  "topics": {
    "order_updates": true,
    "payments": true,
    "shipping": true,
    "returns": true,
    "security": true,
    "support": true,
    "marketing": false
  },
  "quietHours": {
    "enabled": false,
    "timezone": "Europe/Berlin",
    "start": "22:00",
    "end": "08:00"
  },
  "digest": {
    "mode": "off",
    "hour": 9,
    "weekday": null
  },
  "updatedAt": "2026-02-18T10:00:00.000Z"
}
```

### `PUT /notifications/preferences/my`
Request:

```json
{
  "channels": {
    "email": false
  },
  "quietHours": {
    "enabled": true,
    "timezone": "Europe/Berlin",
    "start": "23:00",
    "end": "07:00"
  },
  "digest": {
    "mode": "daily",
    "hour": 8
  }
}
```

Response `200`: полный объект preferences.

### `POST /notifications/stream-token`
Response `200`:

```json
{
  "token": "nst_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2026-02-18T11:30:00.000Z"
}
```

### `GET /notifications/stream?token=<streamToken>&lastEventId=<optional>`
`Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`.

Server sends JSON envelope in `data`:

```json
{ "type": "notification.created", "notification": { "id": "..." } }
```

Supported stream events in payload `type`:
- `notification.created`
- `notification.updated`
- `notification.deleted`
- `notification.unread_count`
- `keepalive`

## 3) Client Side (this repo)

Готовый клиент добавлен в:
- `src/types/notification.ts`
- `src/services/notificationsApi.ts`

Ключевые методы:
- `NotificationsApi.list(params)`
- `NotificationsApi.unreadCount()`
- `NotificationsApi.markRead(id)`
- `NotificationsApi.markReadBulk(payload)`
- `NotificationsApi.archive(id)`
- `NotificationsApi.getPreferences()`
- `NotificationsApi.updatePreferences(payload)`
- `NotificationsApi.createStreamToken()`
- `NotificationsApi.openStream(options)`

Пример подключения:

```ts
import { NotificationsApi } from "../services/notificationsApi";

const page = await NotificationsApi.list({ limit: 20, unreadOnly: true });

const { token } = await NotificationsApi.createStreamToken();

const stop = NotificationsApi.openStream({
  token,
  onEvent: (event) => {
    if (event.type === "notification.created") {
      // append to UI store
    }
  },
  onError: (error) => {
    console.error(error);
  },
});

// later
stop();
```

## 4) Production Notes

- Outbox processor: `FOR UPDATE SKIP LOCKED`, idempotent by `dedupe_key`.
- Delivery retries: exponential backoff + DLQ after max attempts.
- Idempotency: unique `(user_id, idempotency_key)` already enforced.
- Pagination: only cursor-based for stable feed under high write load.
- Security: stream token short-lived (5-15 min), scope only to current user.
- Retention: archive/delete policy by TTL to control table growth.
- Observability: include `requestId`, log delivery attempts and provider responses.

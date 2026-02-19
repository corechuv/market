import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import cls from "../components/UI/Toast/ToastViewport.module.scss";
import CloseIcon from "../components/Icons/CloseIcon";

export type ToastTone = "success" | "info" | "warning" | "error";

export type ToastInput = {
  message: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ToastItem = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  show: (input: ToastInput) => string;
  dismiss: (id: string) => void;
  clear: () => void;
  success: (message: string, durationMs?: number) => string;
  info: (message: string, durationMs?: number) => string;
  warning: (message: string, durationMs?: number) => string;
  error: (message: string, durationMs?: number) => string;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_DURATION_MS = 2200;
const MIN_DURATION_MS = 900;
const MAX_VISIBLE_TOASTS = 3;

function makeToastId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());
  const itemsRef = useRef<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clear = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current.clear();
    setItems([]);
  }, []);

  const scheduleDismiss = useCallback(
    (id: string, durationMs: number) => {
      const existingTimer = timersRef.current.get(id);
      if (existingTimer) {
        window.clearTimeout(existingTimer);
      }
      const timerId = window.setTimeout(() => {
        dismiss(id);
      }, durationMs);
      timersRef.current.set(id, timerId);
    },
    [dismiss],
  );

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const show = useCallback(
    (input: ToastInput) => {
      const tone = input.tone ?? "info";
      const durationMs = Math.max(MIN_DURATION_MS, input.durationMs ?? DEFAULT_DURATION_MS);
      const duplicate = itemsRef.current.find(
        (item) => item.message === input.message && item.tone === tone,
      );

      if (duplicate) {
        scheduleDismiss(duplicate.id, durationMs);
        return duplicate.id;
      }

      const id = makeToastId();

      setItems((prev) => {
        const next = [...prev, { id, message: input.message, tone }];
        if (next.length <= MAX_VISIBLE_TOASTS) return next;

        const removed = next.slice(0, next.length - MAX_VISIBLE_TOASTS);
        removed.forEach((item) => {
          const timer = timersRef.current.get(item.id);
          if (timer) {
            window.clearTimeout(timer);
            timersRef.current.delete(item.id);
          }
        });
        return next.slice(-MAX_VISIBLE_TOASTS);
      });

      scheduleDismiss(id, durationMs);

      return id;
    },
    [scheduleDismiss],
  );

  const success = useCallback(
    (message: string, durationMs?: number) =>
      show({ message, tone: "success", durationMs }),
    [show],
  );
  const info = useCallback(
    (message: string, durationMs?: number) => show({ message, tone: "info", durationMs }),
    [show],
  );
  const warning = useCallback(
    (message: string, durationMs?: number) =>
      show({ message, tone: "warning", durationMs }),
    [show],
  );
  const error = useCallback(
    (message: string, durationMs?: number) => show({ message, tone: "error", durationMs }),
    [show],
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      timersRef.current.clear();
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      dismiss,
      clear,
      success,
      info,
      warning,
      error,
    }),
    [show, dismiss, clear, success, info, warning, error],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div className={cls.viewport} role="status" aria-live="polite">
            {items.map((item) => (
              <div key={item.id} className={`${cls.toast} ${cls[item.tone]}`}>
                <span className={cls.toast__message}>{item.message}</span>
                <CloseIcon
                  className={cls.toast__close}
                  aria-label="Close notification"
                  onClick={() => dismiss(item.id)}
                />
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

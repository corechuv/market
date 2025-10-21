// src/components/Product/Review/ReviewComposer.tsx
import React from "react";
import * as UpChunk from "@mux/upchunk";
import { createMuxDirectUpload } from "../../../services/muxApi";
import { createReview, addReviewMedia } from "../../../services/reviewApi";
// import type { ReviewType } from "../../../types/review/review"; // больше не нужен
import styles from "./ReviewComposer.module.scss";
import Button from "../../UI/Button";
import { TextareaField } from "../../UI/TextareaField";
import ChevronLeftIcon from "../../Icons/ChevronRightIcon";

type ReviewMode = "choose" | "plain" | "reel";

type Props = {
  productId: string;

  /** Перехват клика по кнопке в топбаре (вместо стандартной отправки) */
  onTopbarPublish?: (mode: Exclude<ReviewMode, "choose">) => void;

  /** Полный кастом правого экшена в топбаре */
  renderTopbarAction?: (ctx: {
    mode: Exclude<ReviewMode, "choose">;
    onDefaultClick: () => void;
    busy: boolean;
    canPublish: boolean;
  }) => React.ReactNode;
};

const RATING_MAX = 5;

/** Цифровой рейтинг 1–5 по всей ширине (как звёзды, но цифры) */
function NumericRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  const items = React.useMemo(
    () => Array.from({ length: RATING_MAX }, (_, i) => i + 1),
    []
  );

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (disabled) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(Math.min(RATING_MAX, value + 1));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(Math.max(1, value - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(1);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(RATING_MAX);
    } else if (/^[1-5]$/.test(e.key)) {
      e.preventDefault();
      onChange(Math.min(RATING_MAX, Number(e.key)));
    }
  };

  return (
    <div
      className={styles.rating}
      role="radiogroup"
      aria-label="Оценка"
      aria-disabled={disabled || undefined}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {items.map((n) => (
        <button
          key={n}
          type="button"
          className={`${styles.ratingItem} ${
            n <= value ? styles.isActive : ""
          }`}
          onClick={() => !disabled && onChange(n)}
          disabled={disabled}
          role="radio"
          aria-checked={n === value}
          aria-label={`${n}`}
        >
          {n}
        </button>
      ))}
      <span className={styles.srOnly} aria-live="polite">
        Оценка: {value} из {RATING_MAX}
      </span>
    </div>
  );
}

export default function ReviewComposer({
  productId,
  onTopbarPublish,
  renderTopbarAction,
}: Props) {
  const [mode, setMode] = React.useState<ReviewMode>("choose"); // новый экран выбора
  const [rating, setRating] = React.useState(5);
  const [text, setText] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  // превью (blob url)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [dragActive, setDragActive] = React.useState(false);

  const isReel = mode === "reel";
  const canPublish = !busy && (mode === "plain" ? true : !!file);

  React.useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [file]);

  const pickFromDialog = () => {
    if (busy) return;
    fileInputRef.current?.click();
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    applyPickedFile(f);
  };

  const applyPickedFile = (f?: File | null) => {
    if (!f) return;
    if (!f.type?.startsWith("video/")) {
      setMsg("Выберите видеофайл");
      return;
    }
    setFile(f);
    setProgress(0);
    setMsg(null);
  };

  // DnD handlers на превью
  const onDragOver: React.DragEventHandler<HTMLDivElement> = (ev) => {
    ev.preventDefault();
    if (!busy) setDragActive(true);
  };
  const onDragLeave: React.DragEventHandler<HTMLDivElement> = () => {
    setDragActive(false);
  };
  const onDrop: React.DragEventHandler<HTMLDivElement> = (ev) => {
    ev.preventDefault();
    setDragActive(false);
    if (busy) return;
    const f = ev.dataTransfer?.files?.[0];
    applyPickedFile(f);
  };
  const onPreviewKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (busy) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pickFromDialog();
    }
  };

  async function submitPlain() {
    await createReview(productId, {
      type: "plain",
      rating,
      text: text.trim() || undefined,
      media: [],
    });
  }

  async function submitReel() {
    if (!file) throw new Error("Выберите видеофайл");

    const { uploadId, uploadUrl } = await createMuxDirectUpload();

    await new Promise<void>((resolve, reject) => {
      const upload = UpChunk.createUpload({
        endpoint: uploadUrl,
        file,
        chunkSize: 8192,
      });
      upload.on("progress", (ev: any) => {
        const pct = Math.max(0, Math.min(100, Math.round(ev?.detail ?? 0)));
        setProgress(pct);
      });
      upload.on("success", () => resolve());
      upload.on("error", (err: any) => {
        const reason =
          (err?.detail && String(err.detail)) ||
          (err && String(err)) ||
          "Upload failed";
        reject(new Error(reason));
      });
    });

    const placeholder = `mux:upload:${uploadId}`;
    try {
      await createReview(productId, {
        type: "reel",
        rating,
        text: text.trim() || undefined,
        media: [{ kind: "video", url: placeholder }],
      });
    } catch (e: any) {
      const raw = String(e?.message ?? "");
      if (raw.includes("409")) {
        try {
          await addReviewMedia(productId, { kind: "video", url: placeholder });
        } catch (e2: any) {
          if (String(e2?.message ?? "").includes("404")) {
            throw new Error(
              "У вас уже есть отзыв по этому товару. Добавление видео к существующему отзыву пока не включено на сервере."
            );
          }
          throw e2;
        }
      } else {
        throw e;
      }
    }
  }

  const onSubmit = async () => {
    if (mode === "choose") return;
    setBusy(true);
    setMsg(null);
    try {
      if (mode === "plain") {
        await submitPlain();
        setMsg("Отзыв создан и отправлен на модерацию.");
      } else {
        await submitReel();
        setMsg(
          "Видео загружено. Идёт обработка Mux; ролик появится после готовности."
        );
      }
      setText("");
      setFile(null);
      setPreviewUrl(null);
      setProgress(0);
      setMode("choose"); // после удачной отправки возвращаемся к выбору
    } catch (e: any) {
      setMsg(e?.message ?? "Не удалось создать отзыв");
    } finally {
      setBusy(false);
    }
  };

  const onBack = () => {
    if (busy) return;
    setMsg(null);
    setFile(null);
    setPreviewUrl(null);
    setProgress(0);
    setMode("choose");
  };

  const onTopbarPublishClick = async () => {
    if (mode === "choose") return;
    if (onTopbarPublish) {
      onTopbarPublish(mode as Exclude<ReviewMode, "choose">);
      return;
    }
    await onSubmit();
  };

  const Controls = (
    <>
      <div className={styles.controls}>
        <div className={styles.ratingWrap}>
          <label className={styles.ratingLabel}>Rating</label>
          <NumericRating value={rating} onChange={setRating} disabled={busy} />
        </div>
      </div>

      <TextareaField
        label="Name"
        placeholder={isReel ? "Description" : "Description"}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={busy}
        resizable="none"
        rows={3}
      />
    </>
  );

  return (
    <div className={styles.root}>
      {/* Верхняя панель с кнопкой назад и Publish (видна в режимах plain|reel) */}
      {mode !== "choose" && (
        <div className={styles.topbar}>
          <Button
            variant="secondary"
            size="small"
            onClick={onBack}
            disabled={busy}
            className={styles.backBtn}
            aria-label="Назад"
          >
            <ChevronLeftIcon />
          </Button>

          <div className={styles.topbarSpacer} />

          {renderTopbarAction ? (
            renderTopbarAction({
              mode: mode as Exclude<ReviewMode, "choose">,
              onDefaultClick: onTopbarPublishClick,
              busy,
              canPublish,
            })
          ) : (
            <Button
              variant="primary"
              size="small"
              onClick={onTopbarPublishClick}
              disabled={!canPublish}
              className={styles.topbarAction}
            >
              {busy ? "Saving…" : "Publish"}
            </Button>
          )}
        </div>
      )}

      <div className={styles.layout__main}>
        {/* Экран выбора типа */}
        {mode === "choose" ? (
          <div className={styles.typePicker}>
            <div className={styles.typeGrid}>
              <button
                type="button"
                className={styles.typeCard}
                onClick={() => setMode("plain")}
                disabled={busy}
              >
                <div className={styles.typeIcon} aria-hidden></div>
                <div className={styles.typeTitle}>Plain</div>
                <div className={styles.typeHint}></div>
              </button>
              <button
                type="button"
                className={styles.typeCard}
                onClick={() => setMode("reel")}
                disabled={busy}
              >
                <div className={styles.typeIcon} aria-hidden></div>
                <div className={styles.typeTitle}>Video</div>
                <div className={styles.typeHint}></div>
              </button>
            </div>
          </div>
        ) : mode === "reel" ? (
          <div className={styles.layout__grid}>
            {/* ЛЕВО: кликабельная drop-зона с превью 9:16, h<=368px */}
            <div
              className={`${styles.previewWrap} ${
                dragActive ? styles.isDragActive : ""
              }`}
              role="button"
              tabIndex={0}
              aria-label={
                file
                  ? "Видео выбрано — кликните, чтобы заменить"
                  : "Загрузить видео — кликните или перетащите файл"
              }
              onClick={pickFromDialog}
              onKeyDown={onPreviewKeyDown}
              onDragOver={onDragOver}
              onDragEnter={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              {previewUrl ? (
                <video
                  className={styles.previewVideo}
                  src={previewUrl}
                  muted
                  playsInline
                  autoPlay
                  loop
                  preload="metadata"
                />
              ) : (
                <div className={styles.previewPlaceholder}>
                  <div className={styles.previewHintTitle}>Загрузить видео</div>
                  <div className={styles.previewHintSub}>
                    Кликните или перетащите сюда • 9:16
                  </div>
                </div>
              )}

              {/* скрытый input для выбора файла по клику */}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={onPick}
                className={styles.srOnly}
                tabIndex={-1}
                disabled={busy}
              />
            </div>

            {/* ПРАВО: текст и остальное */}
            <div className={styles.reelRight}>
              {Controls}

              {progress > 0 && (
                <div className={styles.progress}>
                  Uploading: {progress}%
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Кнопку Publish снизу удалили — теперь она в топбаре */}

              {msg && (
                <div
                  className={`${styles.msg} ${
                    msg.startsWith("Не удалось") ? styles.msgError : ""
                  }`}
                >
                  {msg}
                </div>
              )}
            </div>
          </div>
        ) : (
          // mode === "plain"
          <div className={styles.layout__fields}>
            {Controls}

            {/* Кнопку Publish снизу удалили — теперь она в топбаре */}

            {msg && (
              <div
                className={`${styles.msg} ${
                  msg.startsWith("Не удалось") ? styles.msgError : ""
                }`}
              >
                {msg}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

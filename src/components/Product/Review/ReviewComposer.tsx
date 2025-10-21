// src/components/Product/Review/ReviewComposer.tsx
import React from "react";
import * as UpChunk from "@mux/upchunk";
import { createMuxDirectUpload } from "../../../services/muxApi";
import { createReview, addReviewMedia } from "../../../services/reviewApi";
import type { ReviewType } from "../../../types/review/review";
import styles from "./ReviewComposer.module.scss";
import Button from "../../UI/Button";
import { TextareaField } from "../../UI/TextareaField";

type Props = { productId: string };

export default function ReviewComposer({ productId }: Props) {
  const [type, setType] = React.useState<ReviewType>("plain");
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
  const onDragOver: React.DragEventHandler<HTMLDivElement> = ev => {
    ev.preventDefault();
    if (!busy) setDragActive(true);
  };
  const onDragLeave: React.DragEventHandler<HTMLDivElement> = () => {
    setDragActive(false);
  };
  const onDrop: React.DragEventHandler<HTMLDivElement> = ev => {
    ev.preventDefault();
    setDragActive(false);
    if (busy) return;
    const f = ev.dataTransfer?.files?.[0];
    applyPickedFile(f);
  };
  const onPreviewKeyDown: React.KeyboardEventHandler<HTMLDivElement> = e => {
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
    setBusy(true);
    setMsg(null);
    try {
      if (type === "plain") {
        await submitPlain();
        setMsg("Отзыв создан и отправлен на модерацию.");
      } else {
        await submitReel();
        setMsg("Видео загружено. Идёт обработка Mux; ролик появится после готовности.");
      }
      setText("");
      setFile(null);
      setPreviewUrl(null);
      setProgress(0);
    } catch (e: any) {
      setMsg(e?.message ?? "Не удалось создать отзыв");
    } finally {
      setBusy(false);
    }
  };

  const Controls = (
    <>
      <div className={styles.controls}>
        <label>
          Тип:&nbsp;
          <select
            value={type}
            onChange={e => setType(e.target.value as ReviewType)}
            disabled={busy}
            className={styles.select}
          >
            <option value="plain">plain</option>
            <option value="reel">video</option>
          </select>
        </label>
        <label>
          Оценка:&nbsp;
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={e => setRating(Math.max(1, Math.min(5, Number(e.target.value) || 5)))}
            className={styles.number}
            disabled={busy}
          />
        </label>
      </div>
      <TextareaField
        placeholder={type === "plain" ? "Ваш отзыв…" : "Комментарий к ролику (необязательно)…"}
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={busy}
        resizable="none"
        rows={3}
      />
    </>
  );

  return (
    <div className={styles.root}>
      {type === "reel" ? (
        <div className={styles.reelLayout}>
          {/* ЛЕВО: кликабельная drop-зона с превью 9:16, h<=368px */}
          <div
            className={`${styles.previewWrap} ${dragActive ? styles.isDragActive : ""}`}
            role="button"
            tabIndex={0}
            aria-label={file ? "Видео выбрано — кликните, чтобы заменить" : "Загрузить видео — кликните или перетащите файл"}
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
                <div className={styles.previewHintSub}>Кликните или перетащите сюда • 9:16</div>
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
                  <div className={styles.progressBar} style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <Button
              variant="primary"
              size="small"
              onClick={onSubmit}
              disabled={busy || !file}
              className={styles.button}
            >
              {busy ? "Сохраняем…" : "Publish"}
            </Button>

            {msg && (
              <div className={`${styles.msg} ${msg.startsWith("Не удалось") ? styles.msgError : ""}`}>
                {msg}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {Controls}
          <Button
            variant="primary"
            size="small"
            onClick={onSubmit}
            disabled={busy}
            className={styles.button}
          >
            {busy ? "Сохраняем…" : "Publish"}
          </Button>
          {msg && (
            <div className={`${styles.msg} ${msg.startsWith("Не удалось") ? styles.msgError : ""}`}>
              {msg}
            </div>
          )}
        </>
      )}
    </div>
  );
}

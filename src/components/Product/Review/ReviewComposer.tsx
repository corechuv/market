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

    const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target.files?.[0] ?? null);
        setProgress(0);
        setMsg(null);
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

        // 1) создаём Mux Direct Upload
        const { uploadId, uploadUrl } = await createMuxDirectUpload();

        // 2) грузим видео через UpChunk (chunkSize — в КИЛОБАЙТАХ; кратно 256; ≤ 512000)
        await new Promise<void>((resolve, reject) => {
            const upload = UpChunk.createUpload({
                endpoint: uploadUrl,
                file,
                chunkSize: 8192, // 8 MiB — ок для браузеров и лимитов tus
                // maxRetries: 3, // при желании
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

        // 3) создаём отзыв (или, если уже есть — пытаемся добавить медиа)
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
            // Если бэк по-прежнему требует «один отзыв на пользователя»
            if (raw.includes("409")) {
                // Попробуем докинуть видео в существующий отзыв, если ручка реализована
                try {
                    await addReviewMedia(productId, {
                        kind: "video",
                        url: placeholder,
                    });
                } catch (e2: any) {
                    // если ручки нет (404) — отдадим понятное сообщение
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
            // reset
            setText("");
            setFile(null);
            setProgress(0);
        } catch (e: any) {
            setMsg(e?.message ?? "Не удалось создать отзыв");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className={styles.root}>
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
            </div>
            <div className={styles.controls}>
                <label>
                    Оценка:&nbsp;
                    <input
                        type="number"
                        min={1}
                        max={5}
                        value={rating}
                        onChange={e =>
                            setRating(Math.max(1, Math.min(5, Number(e.target.value) || 5)))
                        }
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

            {
                type === "reel" && (
                    <div className={styles.reel}>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={onPick}
                            disabled={busy}
                            className={styles.fileInput}
                        />
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
                    </div>
                )
            }

            <Button
                variant="primary"
                size="small"
                onClick={onSubmit}
                disabled={busy || (type === "reel" && !file)}
                className={styles.button}
            >
                {busy ? "Сохраняем…" : type === "plain" ? "Publish" : "Publish"}
            </Button>

            {
                msg && (
                    <div className={`${styles.msg} ${msg.startsWith("Не удалось") ? styles.msgError : ""}`}>
                        {msg}
                    </div>
                )
            }
        </div >
    );
}

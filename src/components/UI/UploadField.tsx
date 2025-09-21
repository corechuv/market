// src/components/UI/UploadField.tsx
import React, { useEffect, useId, useRef, useState } from "react";
import cs from "./UploadField.module.scss";
import PlusIcon from "../Icons/PlusIcon";
import CloseIcon from "../Icons/CloseIcon";

export type UploadFieldChange = {
  files: File[];          // только что добавленные файлы (может быть пусто)
  dataUrls: string[];     // полный актуальный список превью
  event: React.ChangeEvent<HTMLInputElement> | null;
};

export type UploadFieldProps = {
  label?: string;
  hint?: string;
  error?: string;
  id?: string;
  className?: string;

  value?: string[];             // внешний контролируемый список dataURL/URL
  accept?: string;              // по умолчанию "image/*"
  multiple?: boolean;           // по умолчанию true
  maxSizeMb?: number;           // лимит размера одного файла (МБ)
  maxFiles?: number;            // лимит количества файлов
  /** Минимальная ширина плитки (px) — сетка сама адаптируется */
  thumbSize?: number;           // по умолчанию 80
  removable?: boolean;          // можно удалять отдельные фото (true)
  dnd?: boolean;                // включить drag&drop (true)
  disabled?: boolean;

  /** 'auto' — показывать счётчик только при наличии maxFiles */
  showCount?: boolean | "auto";

  onChange?: (p: UploadFieldChange) => void;

  // Доп. пропсы для input[type=file] (кроме onChange/type/accept/multiple)
  inputProps?: Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange" | "accept" | "multiple"
  >;
};

export const UploadField: React.FC<UploadFieldProps> = ({
  label,
  hint,
  error,
  id,
  className,
  value,
  accept = "image/*",
  multiple = true,
  maxSizeMb,
  maxFiles,
  thumbSize = 80,
  removable = true,
  dnd = true,
  disabled,
  showCount = "auto",
  onChange,
  inputProps,
}) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const errId = `${inputId}-err`;
  const countId = `${inputId}-count`;

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [items, setItems] = useState<string[]>(value ?? []);
  const [dragActive, setDragActive] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);

  const showErr = localErr || error;

  // синхронизация с внешним value
  useEffect(() => {
    if (Array.isArray(value)) setItems(value);
  }, [value]);

  const isImageAccept = (accept || "").includes("image");

  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("read_error"));
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsDataURL(file);
    });
  }

  async function pickFiles(files: File[], event: React.ChangeEvent<HTMLInputElement> | null) {
    setLocalErr(null);
    if (!files.length) return;

    // валидация
    const valid: File[] = [];
    for (const f of files) {
      if (disabled) break;
      if (maxSizeMb && f.size > maxSizeMb * 1024 * 1024) {
        setLocalErr(`Файл «${f.name}» больше ${maxSizeMb} МБ`);
        continue;
      }
      if (isImageAccept && !f.type.startsWith("image/")) {
        setLocalErr(`«${f.name}» не является изображением`);
        continue;
      }
      valid.push(f);
    }
    if (!valid.length) return;

    // ограничение по количеству
    let room = Infinity;
    if (typeof maxFiles === "number") {
      room = Math.max(maxFiles - items.length, 0);
    }
    const toRead = valid.slice(0, room);
    if (!toRead.length) {
      setLocalErr(`Можно прикрепить не более ${maxFiles} файлов`);
      return;
    }

    const data = await Promise.all(toRead.map(fileToDataUrl));
    const next = multiple ? [...items, ...data] : [data[0]];
    setItems(next);
    onChange?.({ files: toRead, dataUrls: next, event });
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    pickFiles(files, e);
    // сбрасываем значение, чтобы повторный выбор того же файла сработал
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleRemove(index: number) {
    if (disabled) return;
    setLocalErr(null);
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    const fakeEvent = { target: fileRef.current } as unknown as React.ChangeEvent<HTMLInputElement>;
    onChange?.({ files: [], dataUrls: next, event: fakeEvent });
  }

  // DnD
  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (!dnd || disabled) return;
    e.preventDefault();
    setDragActive(true);
  }
  function onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    if (!dnd || disabled) return;
    e.preventDefault();
    setDragActive(false);
  }
  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    if (!dnd || disabled) return;
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    pickFiles(files, null);
  }

  // счётчик
  const shouldShowCount =
    showCount === "auto" ? typeof maxFiles === "number" : !!showCount;
  const countText =
    typeof maxFiles === "number" ? `${items.length}/${maxFiles}` : `${items.length}`;

  const describedBy = [
    hint ? hintId : "",
    showErr ? errId : "",
    shouldShowCount ? countId : "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  // CSS var для минимальной ширины плитки
  const gridStyle = { ["--tile-min" as any]: `${thumbSize}px` };

  return (
    <div className={[cs.field, className || ""].join(" ")}>
      {label && (
        <label className={cs.label} htmlFor={inputId}>
          {label}
        </label>
      )}

      <div
        className={[
          cs.gridWrap,
          dragActive ? cs.dragActive : "",
          disabled ? cs.disabled : "",
          showErr ? cs.hasError : "",
        ].join(" ")}
        aria-describedby={describedBy || undefined}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className={cs.grid} style={gridStyle}>
          {items.map((src, i) => (
            <div key={i} className={cs.thumb} role="group" aria-label={`Загруженное изображение ${i + 1}`}>
              <img src={src} alt={`Загруженное изображение ${i + 1}`} className={cs.img} />
              {removable && !disabled && (
                <button
                  type="button"
                  className={cs.removeBtn}
                  aria-label={`Удалить изображение ${i + 1}`}
                  onClick={() => handleRemove(i)}
                  title="Удалить"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          ))}

          {/* плитка "добавить" */}
          {!disabled && (!maxFiles || items.length < maxFiles) && (
            <button
              type="button"
              className={cs.addTile}
              onClick={() => fileRef.current?.click()}
              aria-label="Добавить файл"
              title="Добавить"
            >
              <PlusIcon />
            </button>
          )}
        </div>

        <input
          {...inputProps}
          id={inputId}
          ref={fileRef}
          type="file"
          accept={accept}
          multiple={multiple}
          hidden
          disabled={disabled}
          onChange={handleInputChange}
        />
      </div>

      <div className={cs.metaRow}>
        {hint && (
          <div id={hintId} className={cs.hint}>
            {hint}
          </div>
        )}
        {shouldShowCount && (
          <div id={countId} className={cs.counter} aria-live="polite">
            {countText}
          </div>
        )}
      </div>

      {showErr && (
        <div id={errId} className={cs.error} role="alert">
          {showErr}
        </div>
      )}
    </div>
  );
};

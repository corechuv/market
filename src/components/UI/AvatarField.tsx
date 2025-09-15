// src/components/UI/AvatarField.tsx
import React, { useId, useRef, useState, useEffect } from "react";
import cs from "./AvatarField.module.scss";
import Button from "./Button";
import PlusIcon from "../Icons/PlusIcon";

export type AvatarFieldChange = {
    file?: File;
    dataUrl?: string | null; // null — если удалили
    event: React.ChangeEvent<HTMLInputElement>;
};

export type AvatarFieldProps = {
    label?: string;
    value?: string;                // dataURL или URL
    hint?: string;
    error?: string;
    id?: string;
    className?: string;

    accept?: string;               // по умолчанию "image/*"
    maxSizeMb?: number;            // необязательный лимит размера
    circle?: boolean;              // аватар круглый? (по умолчанию true)
    size?: number;                 // размер превью в px (по умолчанию 80)
    removable?: boolean;           // показывать кнопку "Удалить" (по умолчанию true)

    // Срабатывает при выборе файла или при удалении
    onChange?: (p: AvatarFieldChange) => void;

    // Доп. пропсы для input[type=file] (кроме onChange/type)
    inputProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange">;
};

export const AvatarField: React.FC<AvatarFieldProps> = ({
    label,
    value,
    hint,
    error,
    id,
    className,
    accept = "image/*",
    maxSizeMb,
    circle = true,
    size = 80,
    removable = true,
    onChange,
    inputProps,
}) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const hintId = `${inputId}-hint`;
    const errId = `${inputId}-err`;
    const fileRef = useRef<HTMLInputElement | null>(null);

    const [preview, setPreview] = useState<string>(value || "");
    const [localErr, setLocalErr] = useState<string | null>(null);

    // Синхронизируемся с внешним value
    useEffect(() => {
        setPreview(value || "");
    }, [value]);

    const showErr = localErr || error;

    function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
        setLocalErr(null);
        const file = e.target.files?.[0];
        if (!file) {
            // пользователь закрыл диалог
            return;
        }

        if (maxSizeMb && file.size > maxSizeMb * 1024 * 1024) {
            setLocalErr(`Файл больше ${maxSizeMb} МБ`);
            return;
        }
        if (accept && !file.type.startsWith("image/")) {
            setLocalErr("Требуется изображение");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = String(reader.result || "");
            setPreview(dataUrl);
            onChange?.({ file, dataUrl, event: e });
        };
        reader.readAsDataURL(file);
    }

    function handleRemove() {
        setLocalErr(null);
        setPreview("");
        if (fileRef.current) fileRef.current.value = "";
        // Сообщим наверх, что аватар очищён
        const fakeEvent = { target: fileRef.current } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange?.({ file: undefined, dataUrl: null, event: fakeEvent });
    }

    return (
        <div className={[cs.field, className || ""].join(" ")}>
            {label && (
                <label className={cs.label} htmlFor={inputId}>
                    {label}
                </label>
            )}

            <div className={cs.row} aria-describedby={`${hint ? hintId : ""} ${showErr ? errId : ""}`.trim()}>
                <div
                    className={cs.preview}
                    style={{ width: size, height: size, borderRadius: circle ? "50%" : "12px" }}
                >
                    {preview ? (
                        <img
                            src={preview}
                            alt="Предпросмотр аватара"
                            className={cs.img}
                        />
                    ) : (
                        <div className={cs.placeholder} aria-hidden>
                            <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="t d">
                                <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".6">
                                    <circle cx="64" cy="52" r="16" fill="none" />
                                    <path d="M34 92c6-14 20-22 30-22s24 8 30 22" fill="none" />
                                </g>
                            </svg>
                        </div>
                    )}
                </div>

                <div className={cs.actions}>
                    <Button
                        type="button"
                        size="small"
                        variant="primary"
                        className={cs.addBtn}
                        onClick={() => fileRef.current?.click()}
                    >
                        <PlusIcon />
                    </Button>
                    {removable && preview && (
                        <Button
                            type="button"
                            size="small"
                            variant="secondary"
                            onClick={handleRemove}
                        >
                            Delete
                        </Button>
                    )}

                    <input
                        {...inputProps}
                        id={inputId}
                        ref={fileRef}
                        type="file"
                        accept={accept}
                        onChange={handlePick}
                        hidden
                    />
                </div>
            </div>
            {hint && <div id={hintId} className={cs.hint}>{hint}</div>}
            {showErr && (
                <div id={errId} className={cs.error} role="alert">
                    {showErr}
                </div>
            )}
        </div>
    );
};

// src/utils/validate/fields.ts

const emailRegex =
    /^(?:[a-zA-Z0-9_'^&/+-])+(?:\.(?:[a-zA-Z0-9_'^&/+-])+)*@(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})$/;

export function validateEmail(v: string) {
    return emailRegex.test(v.trim());
}

export function passwordStrength(pw: string) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4); // 0..4
}

export const required = (v?: string) => (!!v && v.trim().length > 0 ? null : "Обязательное поле");

export const validatePhone = (v?: string) => (!v || /^\+?[0-9\s\-()]{7,}$/.test(v) ? null : "Некорректный телефон");
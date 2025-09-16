// src/utils/validate/fields.ts

/** Общие типы */
export type Validator<V = any> = (value: V, allValues?: any) => string | null;
export type FieldRules<T extends Record<string, any>> = {
    [K in keyof T]?: Validator<T[K]>;
};
export type FieldErrors<T extends Record<string, any>> = Partial<
    Record<keyof T, string>
>;

/** Прогон правил над объектом значений формы */
export function validateForm<T extends Record<string, any>>(
    values: T,
    rules: FieldRules<T>
): FieldErrors<T> {
    const out: FieldErrors<T> = {};
    (Object.keys(rules) as Array<keyof T>).forEach((k) => {
        const rule = rules[k];
        if (!rule) return;
        const err = rule(values[k], values);
        if (err) out[k] = err;
    });
    return out;
}

/** Проверка наличия ошибок */
export const hasErrors = (
    errs: Record<string, string | null | undefined>
) => Object.values(errs).some(Boolean);

/** Комбинирование нескольких валидаторов в один */
export const compose =
    <V,>(...validators: Validator<V>[]): Validator<V> =>
        (value, all) => {
            for (const fn of validators) {
                const err = fn(value, all);
                if (err) return err;
            }
            return null;
        };

/** Базовые валидаторы */
export const required = (
    msg = "Required field"
): Validator<string | null | undefined> => (v) =>
        !!v && String(v).trim().length > 0 ? null : msg;

export const requiredTrue = (msg = "Needs to be accepted"): Validator<boolean> => (v) =>
    v ? null : msg;

export const minLength =
    (n: number, msg?: string): Validator<string> =>
        (v) =>
            v && v.trim().length >= n ? null : msg || `Minimum ${n} characters`;

export const maxLength =
    (n: number, msg?: string): Validator<string> =>
        (v) =>
            v && v.trim().length <= n ? null : msg || `Maximum ${n} characters`;

export const pattern =
    (re: RegExp, msg = "Invalid format"): Validator<string> =>
        (v) =>
            v && re.test(v) ? null : msg;

/** Email */
const emailRegex =
    /^(?:[a-zA-Z0-9_'^&/+-])+(?:\.(?:[a-zA-Z0-9_'^&/+-])+)*@(?:(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})$/;

export const validateEmail: Validator<string> = (v) =>
    v && emailRegex.test(v.trim()) ? null : "Invalid email address";

/** Телефон (простая проверка, допускает E.164/маски) */
export const validatePhone: Validator<string | undefined> = (v) =>
    !v || /^\+?[0-9\s\-()]{7,}$/.test(v)
        ? null
        : "Некорректный телефон";

/** Совпадение значений (например, подтверждение пароля) */
export const sameAs =
    <T = any>(getOther: (all: any) => T, msg = "Values do not match"): Validator<T> =>
        (v, all) =>
            v === getOther(all) ? null : msg;

/** Пароль: «оценка сложности» 0..4 */
export function passwordStrength(pw: string) {
    let score = 0;
    if ((pw || "").length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 4); // 0..4
}

/** Требование минимальной «оценки сложности» пароля */
export const passwordMinScore =
    (min = 2, msg = "Password is too weak"): Validator<string> =>
        (v) =>
            passwordStrength(v || "") >= min ? null : msg;

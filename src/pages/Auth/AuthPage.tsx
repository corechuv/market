// src/pages/Auth/AuthPage.tsx
import React, { useEffect, useRef, useState } from "react"
import { Helmet } from "react-helmet-async"
import s from "./AuthPage.module.scss"
import { TextField } from "../../components/UI/TextField"
import { PasswordField } from "../../components/UI/PasswordField"
import { CheckboxField } from "../../components/UI/CheckboxField"
import Button from "../../components/UI/Button"
import Logo from "../../components/Footer/Logo"

import {
    passwordStrength,
    validateEmail,
    required,
    minLength,
    sameAs,
    requiredTrue,
    validateForm,
    type FieldErrors,
    compose,
} from "../../utils/validate/fields"

import { Tabs, type TabItem } from "../../components/UI/Tabs"
import { useTranslation, Trans } from "react-i18next"
import { useNavigate } from "react-router-dom"

export type Mode = "login" | "register";

type LoginPayload = {
    email: string;
    password: string;
    remember: boolean;
};

type RegisterPayload = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirm: string;
    agree: boolean;
};

export interface AuthPageProps {
    /** какой таб активен: login | register */
    mode: Mode;
    /** смена таба (сюда пробрасываем router) */
    onModeChange: (mode: Mode) => void;

    onLogin?: (data: LoginPayload) => Promise<void> | void;
    onRegister?: (
        data: Omit<RegisterPayload, "confirm" | "agree">
    ) => Promise<void> | void;
}

const Spinner: React.FC = () => {
    const { t } = useTranslation("auth");
    return <span className={s.spinner} aria-label={t("spinner.loading")} />;
};

export default function AuthPage({
    mode,
    onModeChange,
    onLogin,
    onRegister,
}: AuthPageProps) {
    const { t } = useTranslation("auth");
    const navigate = useNavigate();

    const seoTitle =
        mode === "login"
            ? t("seo.login.title")
            : t("seo.register.title");

    const seoDescription =
        mode === "login"
            ? t("seo.login.description")
            : t("seo.register.description");

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const loginRef = useRef<HTMLFormElement>(null);
    const registerRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        const form = mode === "login" ? loginRef.current : registerRef.current;
        const first = form?.querySelector<HTMLInputElement>("input");
        first?.focus();
    }, [mode]);

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrors({});
        const data = new FormData(e.currentTarget);
        const payload: LoginPayload = {
            email: String(data.get("email") || ""),
            password: String(data.get("password") || ""),
            remember: Boolean(data.get("remember")),
        };

        const loginRules = {
            email: compose(
                required(t("errors.emailRequired")),
                validateEmail
            ),
            password: compose(
                required(t("errors.passwordRequired")),
                minLength(6)
            ),
        } as const;

        const errs = validateForm(payload, loginRules) as FieldErrors<LoginPayload>;
        if (Object.keys(errs).length) {
            setErrors(errs as Record<string, string>);
            return;
        }

        setLoading(true);
        try {
            if (onLogin) await onLogin(payload);
            else await new Promise((r) => setTimeout(r, 400));
        } catch (serverErr: any) {
            setErrors(serverErr ?? { password: t("errors.loginFailed") });
            return;
        } finally {
            setLoading(false);
        }
    }

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrors({});
        const data = new FormData(e.currentTarget);
        const payload: RegisterPayload = {
            firstName: String(data.get("firstName") || ""),
            lastName: String(data.get("lastName") || ""),
            email: String(data.get("email") || ""),
            password: String(data.get("password") || ""),
            confirm: String(data.get("confirm") || ""),
            agree: Boolean(data.get("agree")),
        };

        const registerRules = {
            firstName: compose(
                required(t("errors.firstNameRequired")),
                minLength(2, t("errors.tooShort"))
            ),
            lastName: compose(
                required(t("errors.lastNameRequired")),
                minLength(2, t("errors.tooShort"))
            ),
            email: compose(
                required(t("errors.emailRequired")),
                validateEmail
            ),
            password: compose(
                required(t("errors.passwordRequired")),
                minLength(8, t("errors.passwordMin"))
            ),
            confirm: sameAs<string>(
                (all) => all.password,
                t("errors.passwordsNotMatch")
            ),
            agree: requiredTrue(t("errors.needsToBeAccepted")),
        } as const;

        const errs = validateForm(payload, registerRules) as FieldErrors<RegisterPayload>;
        if (Object.keys(errs).length) {
            setErrors(errs as Record<string, string>);
            return;
        }

        setLoading(true);
        try {
            if (onRegister) {
                const { firstName, lastName, email, password } = payload;
                await onRegister({ firstName, lastName, email, password });
            } else {
                await new Promise((r) => setTimeout(r, 500));
            }
        } catch (serverErr: any) {
            setErrors(serverErr ?? { email: t("errors.registerFailed") });
            return;
        } finally {
            setLoading(false);
        }
    }

    const strength = (val: string) => passwordStrength(val);

    const tabs: TabItem<Mode>[] = [
        { key: "login", label: t("tabs.login") },
        { key: "register", label: t("tabs.register") },
    ];

    return (
        <>
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                {/* обычно login/register не индексируют */}
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
            <div className={s.page}>
                <div className={s.center}>
                    <div className={s.card} role="dialog" aria-labelledby="auth-title">
                        <header className={s.brand}>
                            <Logo onClick={() => navigate("/")} ariaLabel="Home" compact />
                        </header>

                        {/* Табы c общим UI-компонентом */}
                        <div className={s.tabs}>
                            <Tabs<Mode>
                                items={tabs}
                                activeKey={mode}
                                onChange={onModeChange}
                                ariaLabel={t("tabs.ariaLabel")}
                            />
                        </div>

                        {/* Login */}
                        <section
                            id="panel-login"
                            role="tabpanel"
                            aria-labelledby="tab-login"
                            hidden={mode !== "login"}
                        >
                            <form
                                ref={loginRef}
                                className={s.form}
                                onSubmit={handleLogin}
                                noValidate
                            >
                                <TextField
                                    name="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    placeholder={t("login.emailPlaceholder")}
                                    label={t("login.emailLabel")}
                                    error={errors.email}
                                />
                                <PasswordField
                                    name="password"
                                    autoComplete="current-password"
                                    placeholder={t("login.passwordPlaceholder")}
                                    label={t("login.passwordLabel")}
                                    error={errors.password}
                                />

                                <div className={s.rowBetween}>
                                    <CheckboxField
                                        name="remember"
                                        defaultChecked
                                        label={t("login.remember")}
                                    />
                                </div>

                                <Button
                                    className={s.cta}
                                    type="submit"
                                    disabled={loading}
                                    size="large"
                                >
                                    {loading ? <Spinner /> : t("login.submit")}
                                </Button>

                                <div className={s.rowBetween}>
                                    <a className={s.mutedLink} href="#forgot">
                                        {t("login.forgot")}
                                    </a>
                                </div>
                            </form>
                        </section>

                        {/* Register */}
                        <section
                            id="panel-register"
                            role="tabpanel"
                            aria-labelledby="tab-register"
                            hidden={mode !== "register"}
                        >
                            <form
                                ref={registerRef}
                                className={s.form}
                                onSubmit={handleRegister}
                                noValidate
                            >
                                <TextField
                                    name="firstName"
                                    label={t("register.firstNameLabel")}
                                    placeholder={t("register.firstNamePlaceholder")}
                                    error={errors.firstName}
                                />
                                <TextField
                                    name="lastName"
                                    label={t("register.lastNameLabel")}
                                    placeholder={t("register.lastNamePlaceholder")}
                                    error={errors.lastName}
                                />
                                <TextField
                                    name="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    label={t("register.emailLabel")}
                                    placeholder={t("register.emailPlaceholder")}
                                    error={errors.email}
                                />
                                <PasswordField
                                    name="password"
                                    autoComplete="new-password"
                                    label={t("register.passwordLabel")}
                                    placeholder={t("register.passwordPlaceholder")}
                                    withStrength
                                    strengthCalc={strength}
                                    error={errors.password}
                                />
                                <PasswordField
                                    name="confirm"
                                    autoComplete="new-password"
                                    label={t("register.confirmLabel")}
                                    placeholder={t("register.confirmPlaceholder")}
                                    error={errors.confirm}
                                />

                                <div className={s.rowBetween}>
                                    <CheckboxField
                                        name="agree"
                                        label={
                                            <Trans
                                                i18nKey="register.agree"
                                                ns="auth"
                                                components={{
                                                    a: <a className={s.mutedLink} href="#terms" />,
                                                }}
                                            />
                                        }
                                    />
                                    {errors.agree && (
                                        <div className={s.formError} role="alert">
                                            {errors.agree}
                                        </div>
                                    )}
                                </div>

                                <Button
                                    className={s.cta}
                                    type="submit"
                                    disabled={loading}
                                    size="large"
                                >
                                    {loading ? <Spinner /> : t("register.submit")}
                                </Button>
                            </form>
                        </section>

                        <footer className={s.footer}>
                            <p className={s.muted}>
                                {t("footer.copyright", { year: new Date().getFullYear() })}
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
}

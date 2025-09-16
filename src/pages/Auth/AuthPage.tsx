import React, { useEffect, useRef, useState } from "react";
import s from "./AuthPage.module.scss";
import { TextField } from "../../components/UI/TextField";
import { PasswordField } from "../../components/UI/PasswordField";
import { CheckboxField } from "../../components/UI/CheckboxField";
import Button from "../../components/UI/Button";
import Logo from "../../components/logo/Logo";
import { passwordStrength, validateEmail } from "../../utils/validate/fields";

type Mode = "login" | "register";

type LoginPayload = {
    email: string;
    password: string;
    remember: boolean;
};

type RegisterPayload = {
    name: string;
    email: string;
    password: string;
    confirm: string;
    agree: boolean;
};

export interface AuthPageProps {
    onLogin?: (data: LoginPayload) => Promise<void> | void;
    onRegister?: (data: RegisterPayload) => Promise<void> | void;
}

const Spinner = () => <span className={s.spinner} aria-label="Loading" />;

export default function AuthPage({ onLogin, onRegister }: AuthPageProps) {
    const [mode, setMode] = useState<Mode>("login");
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

        const errs: Record<string, string> = {};
        if (!validateEmail(payload.email)) errs.email = "Invalid email address";
        if (payload.password.length < 6) errs.password = "Minimum 6 characters";
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }

        setLoading(true);
        try {
            if (onLogin) await onLogin(payload);
            else await new Promise((r) => setTimeout(r, 400));
            console.log("Logged in", payload);
        } finally {
            setLoading(false);
        }
    }

    async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrors({});
        const data = new FormData(e.currentTarget);
        const payload: RegisterPayload = {
            name: String(data.get("name") || ""),
            email: String(data.get("email") || ""),
            password: String(data.get("password") || ""),
            confirm: String(data.get("confirm") || ""),
            agree: Boolean(data.get("agree")),
        };

        const errs: Record<string, string> = {};
        if (payload.name.trim().length < 2) errs.name = "Name is too short";
        if (!validateEmail(payload.email)) errs.email = "Invalid email address";
        if (payload.password.length < 8) errs.password = "Password must be at least 8 characters";
        if (payload.confirm !== payload.password) errs.confirm = "Passwords do not match";
        if (!payload.agree) errs.agree = "Needs to be accepted";
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }

        setLoading(true);
        try {
            if (onRegister) await onRegister(payload);
            else await new Promise((r) => setTimeout(r, 500));
            console.log("Registered", payload);
        } finally {
            setLoading(false);
        }
    }

    const strength = (val: string) => passwordStrength(val);

    return (
        <div className={s.page}>
            <div className={s.center}>
                <div className={s.card} role="dialog" aria-labelledby="auth-title">
                    <header className={s.brand}>
                        <Logo />
                    </header>

                    <nav
                        className={s.tabs}
                        role="tablist"
                        aria-label="Auth tabs"
                        data-mode={mode}
                    >
                        <button
                            role="tab"
                            aria-selected={mode === "login"}
                            aria-controls="panel-login"
                            id="tab-login"
                            className={s.tab}
                            onClick={() => setMode("login")}
                        >
                            Login
                        </button>
                        <button
                            role="tab"
                            aria-selected={mode === "register"}
                            aria-controls="panel-register"
                            id="tab-register"
                            className={s.tab}
                            onClick={() => setMode("register")}
                        >
                            Registration
                        </button>
                        <div className={s.pill} aria-hidden />
                    </nav>

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
                                placeholder="name@company.com"
                                label="Email"
                                error={errors.email}
                            />
                            <PasswordField
                                name="password"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                label="Password"
                                error={errors.password}
                            />

                            <div className={s.rowBetween}>
                                <CheckboxField
                                    name="remember"
                                    defaultChecked
                                    label="Remember me"
                                />
                                <a className={s.mutedLink} href="#forgot">
                                    Forgot password?
                                </a>
                            </div>

                            <Button className={s.cta} type="submit" disabled={loading} size="large">
                                {loading ? <Spinner /> : "Login"}
                            </Button>
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
                                name="name"
                                label="Name"
                                placeholder="Markus"
                                error={errors.name}
                            />
                            <TextField
                                name="email"
                                inputMode="email"
                                autoComplete="email"
                                label="Email"
                                placeholder="name@example.com"
                                error={errors.email}
                            />
                            <PasswordField
                                name="password"
                                autoComplete="new-password"
                                label="Password"
                                placeholder="Minimum 8 characters"
                                withStrength
                                strengthCalc={strength}
                                error={errors.password}
                            />
                            <PasswordField
                                name="confirm"
                                autoComplete="new-password"
                                label="Confirm Password"
                                placeholder="Repeat"
                                error={errors.confirm}
                            />

                            <div className={s.rowBetween}>
                                <CheckboxField
                                    name="agree"
                                    label={
                                        <>
                                            I {" "}
                                            <a className={s.mutedLink} href="#terms">
                                                agree to the terms
                                            </a>
                                        </>
                                    }
                                />
                                {errors.agree && (
                                    <div className={s.formError} role="alert">
                                        {errors.agree}
                                    </div>
                                )}
                            </div>

                            <Button className={s.cta} type="submit" disabled={loading} size="large">
                                {loading ? <Spinner /> : "Register"}
                            </Button>
                        </form>
                    </section>

                    <footer className={s.footer}>
                        <p className={s.muted}>
                            © {new Date().getFullYear()} Dashedo. All rights reserved.
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}

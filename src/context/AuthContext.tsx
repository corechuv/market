// src/context/AuthContext.tsx
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import api from "../lib/api";

const ACCESS_KEY = "mp_auth_access";
const REFRESH_KEY = "mp_auth_refresh";
const USER_KEY = "mp_auth_user";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
const pickStorage = (remember?: boolean): StorageLike =>
    remember ? localStorage : sessionStorage;

type User = any;

type AuthCtx = {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (p: {
        email: string; // может быть и username
        password: string;
        remember?: boolean;
    }) => Promise<void>;
    register: (p: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        username?: string; // если не передать — возьмём часть до @ из email
        remember?: boolean;
    }) => Promise<void>;
    logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

/** Универсально достаём значение из localStorage -> sessionStorage */
function getFromStorages(key: string): string | null {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

/** Нормализуем разные варианты имён полей токенов */
function pickTokens(resp: any) {
    const access: string | null =
        resp?.accessToken ?? resp?.access_token ?? null;
    const refresh: string | null =
        resp?.refreshToken ?? resp?.refresh_token ?? null;
    return { access, refresh };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // === refresh state (один рефреш за раз, очередь повторов)
    const refreshingRef = useRef<Promise<string | null> | null>(null);

    /** Применяем токены/пользователя и проставляем Authorization */
    const persistAuth = useCallback(
        (
            access: string | null,
            refresh: string | null,
            me: any | null,
            remember?: boolean
        ) => {
            const st = pickStorage(remember);
            if (access) st.setItem(ACCESS_KEY, access);
            if (refresh) st.setItem(REFRESH_KEY, refresh);
            if (me) {
                const json = JSON.stringify(me);
                st.setItem(USER_KEY, json);
                // дублируем в localStorage, чтобы юзер не слетал после F5
                localStorage.setItem(USER_KEY, json);
            }
            if (access) {
                api.defaults.headers.common.Authorization = `Bearer ${access}`;
            }
        },
        []
    );

    /** Полная очистка авторизации */
    const clearAuth = useCallback(() => {
        [localStorage, sessionStorage].forEach((st) => {
            st.removeItem(ACCESS_KEY);
            st.removeItem(REFRESH_KEY);
            st.removeItem(USER_KEY);
        });
        delete api.defaults.headers.common.Authorization;
        setUser(null);
    }, []);

    /** Выполнить refresh по имеющемуся refreshToken */
    const doRefresh = useCallback(async (): Promise<string | null> => {
        // уже идёт рефреш — дождёмся
        if (refreshingRef.current) return refreshingRef.current;

        const task = (async () => {
            const refreshToken =
                getFromStorages(REFRESH_KEY); // ищем где угодно
            if (!refreshToken) return null;

            try {
                const { data } = await api.post("/auth/refresh", {
                    refreshToken, // сервер ждёт camelCase
                });
                const { access, refresh } = pickTokens(data);
                if (!access) return null;
                // не знаем remember — положим туда же, где лежал старый refresh
                const remember = !!localStorage.getItem(REFRESH_KEY);
                persistAuth(access, refresh ?? null, null, remember);
                return access;
            } catch {
                // refresh не удался — сносим всё
                clearAuth();
                return null;
            } finally {
                refreshingRef.current = null;
            }
        })();

        refreshingRef.current = task;
        return task;
    }, [clearAuth, persistAuth]);

    // === Инициализация: подхват токена/пользователя, догрузка me при необходимости
    useEffect(() => {
        const access =
            localStorage.getItem(ACCESS_KEY) ||
            sessionStorage.getItem(ACCESS_KEY);
        const cachedUser =
            localStorage.getItem(USER_KEY) ||
            sessionStorage.getItem(USER_KEY);

        if (access) {
            api.defaults.headers.common.Authorization = `Bearer ${access}`;
        }
        if (cachedUser) {
            try {
                setUser(JSON.parse(cachedUser));
            } catch {
                /* ignore */
            }
        }

        (async () => {
            try {
                if (access && !cachedUser) {
                    const { data } = await api.get("/auth/me");
                    setUser(data);
                    localStorage.setItem(USER_KEY, JSON.stringify(data));
                }
            } catch {
                clearAuth();
            } finally {
                setLoading(false);
            }
        })();
    }, [clearAuth]);

    // === Глобальный перехватчик 401: авто-рефреш + повтор запроса
    useEffect(() => {
        const respId = api.interceptors.response.use(
            (r) => r,
            async (error) => {
                const status = error?.response?.status;
                const cfg = error?.config || {};
                if (status !== 401) throw error;

                // не пытаемся рефрешить сами эндпоинты аутентификации
                const url: string = (cfg.url || "") as string;
                if (/\/auth\/(login|register|refresh)/.test(url)) {
                    throw error;
                }

                // чтобы один запрос не зациклить
                if ((cfg as any)._retry) {
                    throw error;
                }
                (cfg as any)._retry = true;

                const newAccess = await doRefresh();
                if (!newAccess) {
                    throw error;
                }

                // повторяем оригинальный запрос с новым токеном
                cfg.headers = cfg.headers || {};
                (cfg.headers as any).Authorization = `Bearer ${newAccess}`;
                return api.request(cfg);
            }
        );

        return () => {
            api.interceptors.response.eject(respId);
        };
    }, [doRefresh]);

    // === Методы контекста

    const login: AuthCtx["login"] = useCallback(
        async ({ email, password, remember }) => {
            setLoading(true);
            try {
                // сервер ожидает emailOrUsername + password
                const { data } = await api.post("/auth/login", {
                    emailOrUsername: email,
                    password,
                });

                // 1) сразу применяем токены → чтобы следующий /me имел Bearer
                const { access, refresh } = pickTokens(data);
                if (access) {
                    persistAuth(access, refresh ?? null, null, remember);
                }

                // 2) получаем профиль
                const meResp = await api.get("/auth/me");
                const me = meResp.data;
                persistAuth(access ?? null, refresh ?? null, me, remember);
                setUser(me);
            } catch (e: any) {
                const s = e?.response?.status;
                const msg = e?.response?.data?.message || "Invalid email or password";
                if (s === 400 || s === 401) throw { email: "", password: msg };
                throw { password: "Server error. Try again." };
            } finally {
                setLoading(false);
            }
        },
        [persistAuth]
    );

    const register: AuthCtx["register"] = useCallback(
        async ({ firstName, lastName, email, password, username, remember }) => {
            setLoading(true);
            try {
                // если username не прислали — берём до '@'
                const uname =
                    (username || (email.includes("@") ? email.split("@")[0] : email))
                        .trim()
                        .toLowerCase();

                const { data } = await api.post("/auth/register", {
                    email,
                    username: uname,
                    password,
                    firstName,
                    lastName,
                    phone: null,
                    dateOfBirth: null,
                });

                // 1) сразу проставляем токены
                const { access, refresh } = pickTokens(data);
                if (access) {
                    persistAuth(access, refresh ?? null, null, remember);
                }

                // 2) тянем профиль
                const meResp = await api.get("/auth/me");
                const me = meResp.data;
                persistAuth(access ?? null, refresh ?? null, me, remember);
                setUser(me);
            } catch (e: any) {
                const s = e?.response?.status;
                const d = e?.response?.data;
                if (s === 409) throw { email: "Email or username already in use" };
                if (s === 400 && d?.errors) throw d.errors;
                throw { email: "Registration failed. Try again." };
            } finally {
                setLoading(false);
            }
        },
        [persistAuth]
    );

    const logout = useCallback(async () => {
        const rt =
            localStorage.getItem(REFRESH_KEY) ||
            sessionStorage.getItem(REFRESH_KEY);
        try {
            if (rt) {
                await api.post("/auth/logout", { refreshToken: rt });
            }
        } catch {
            /* ok – просто чистим локально */
        }
        clearAuth();
    }, [clearAuth]);

    const value = useMemo<AuthCtx>(
        () => ({
            user,
            isAuthenticated: !!user,
            loading,
            login,
            register,
            logout,
        }),
        [user, loading, login, register, logout]
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}

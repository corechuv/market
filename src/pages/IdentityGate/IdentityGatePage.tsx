// src/pages/IdentityGate/IdentityGatePage.tsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import c from "./IdentityGatePage.module.scss";

import Page from "../../components/UI/Page/Page";
import Button from "../../components/UI/Button";
import { useAuth } from "../../context/AuthContext";
import Wrapper from "../../components/Checkout/User/Wrapper";
import WrapperSkeleton from "../../components/Checkout/User/Wrapper.Skeleton";
import { buildAvatarSrc } from "../../utils/avatar";
import { useTranslation } from "react-i18next";

const IdentityGatePage: React.FC = () => {
    const { isAuthenticated, user, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation("identityGate");

    const params = new URLSearchParams(location.search);
    // Куда идти после выбора личности (по умолчанию — checkout)
    const next = params.get("next") || "/checkout";

    const goBackToCart = () => {
        navigate("/cart");
    };

    const continueToNext = () => {
        navigate(next);
    };

    const continueAsGuest = () => {
        navigate(next);
    };

    const goToLogin = () => {
        navigate(`/auth/login?next=${encodeURIComponent(next)}`);
    };

    const goToRegister = () => {
        navigate(`/auth/register?next=${encodeURIComponent(next)}`);
    };

    const switchAccount = async () => {
        await logout();
        navigate(`/auth/login?next=${encodeURIComponent(next)}`);
    };

    return (
        <Page>
            <div className={c.gate}>
                {authLoading ? (
                    <div>
                        <WrapperSkeleton />
                        <div className="actions" style={{ marginTop: 20 }}>
                            <Button
                                size="small"
                                variant="secondary"
                                onClick={goBackToCart}
                                type="button"
                            >
                                {t("buttons.back")}
                            </Button>
                        </div>
                    </div>
                ) : isAuthenticated ? (
                    // Уже залогинен
                    <>
                        {user && (
                            <>
                                {(() => {
                                    const nameOrEmail =
                                        (user as any)?.firstName || (user as any)?.lastName
                                            ? `${(user as any)?.firstName ?? ""} ${(user as any)?.lastName ?? ""
                                                }`.trim()
                                            : (user as any)?.email ?? t("title");

                                    const username = (user as any)?.username;

                                    const avatarUrl = buildAvatarSrc(
                                        (user as any).avatarUrl,
                                        `${(user as any).id}-${(user as any).avatarUrl || ""
                                        }`
                                    );

                                    return (
                                        <Wrapper
                                            photoUrl={avatarUrl}
                                            username={username}
                                            fullname={nameOrEmail}
                                        />
                                    );
                                })()}
                            </>
                        )}

                        <div className={c.gate__actions}>
                            <Button size="small" onClick={continueToNext}>
                                {t("buttons.continue")}
                            </Button>
                            {user && (
                                <Button
                                    size="small"
                                    variant="secondary"
                                    onClick={switchAccount}
                                >
                                    {t("buttons.switchAccount")}
                                </Button>
                            )}
                            <Button
                                size="small"
                                variant="link"
                                onClick={goBackToCart}
                                type="button"
                            >
                                {t("buttons.back")}
                            </Button>
                        </div>
                    </>
                ) : (
                    // Гость: выбор гостя / логин / регистрация
                    <>
                        <h2 className={c.gate__title}>{t("title")}</h2>
                        <h2 className={c.gate__description}>{t("description")}</h2>
                        <div className={c.gate__actions}>
                            <Button
                                size="small"
                                className="btn"
                                type="button"
                                onClick={continueAsGuest}
                            >
                                {t("buttons.continueAsGuest")}
                            </Button>
                            <Button
                                size="small"
                                className="btn btn--ghost"
                                type="button"
                                onClick={goToLogin}
                            >
                                {t("buttons.login")}
                            </Button>
                            <Button
                                size="small"
                                className="btn btn--ghost"
                                type="button"
                                onClick={goToRegister}
                            >
                                {t("buttons.register")}
                            </Button>
                            <Button
                                size="small"
                                variant="link"
                                type="button"
                                onClick={goBackToCart}
                            >
                                {t("buttons.back")}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Page>
    );
};

export default IdentityGatePage;

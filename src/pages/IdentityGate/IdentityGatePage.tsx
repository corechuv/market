// src/pages/IdentityGate/IdentityGatePage.tsx
import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import c from "./IdentityGatePage.module.scss";

import Page from "../../components/UI/Page/Page";
import Button from "../../components/UI/Button";
import { useAuth } from "../../context/AuthContext";
import Wrapper from "../../components/Checkout/User/Wrapper";
import WrapperSkeleton from "../../components/Checkout/User/Wrapper.Skeleton";
import { buildAvatarSrc } from "../../utils/avatar";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

const IdentityGatePage: React.FC = () => {
    const { isAuthenticated, user, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation("identityGate");

    const params = new URLSearchParams(location.search);
    // Куда идти после выбора личности (по умолчанию — checkout)
    const next = params.get("next") || "/checkout";

    const goBackToCart = () => navigate("/cart");
    const continueToNext = () => navigate(next);
    const continueAsGuest = () => navigate(next);
    const goToLogin = () =>
        navigate(`/auth/login?next=${encodeURIComponent(next)}`);
    const goToRegister = () =>
        navigate(`/auth/register?next=${encodeURIComponent(next)}`);
    const switchAccount = async () => {
        await logout();
        navigate(`/auth/login?next=${encodeURIComponent(next)}`);
    };

    // -------------------- SEO --------------------
    const {
        displayName,
        avatarUrl,
        username: displayUsername,
    } = useMemo(() => {
        if (!user) {
            return {
                displayName: t("seo.guest.fallbackName"),
                avatarUrl: undefined as string | undefined,
                username: undefined as string | undefined,
            };
        }

        const first = ((user as any).firstName || "").trim();
        const last = ((user as any).lastName || "").trim();
        const full = `${first} ${last}`.trim();
        const nameOrEmail =
            full || (user as any).email || t("seo.guest.fallbackName");

        const username = (user as any).username as string | undefined;
        const avatar = buildAvatarSrc(
            (user as any).avatarUrl,
            `${(user as any).id}-${(user as any).avatarUrl || ""}`
        );

        return {
            displayName: nameOrEmail,
            avatarUrl: avatar,
            username,
        };
    }, [user, t]);

    const isGuestView = !authLoading && !isAuthenticated;

    const canonicalUrl = "https://dashedo.com/identity-gate";

    const seoTitle = isGuestView
        ? t("seo.guest.title")
        : t("seo.user.title", { name: displayName });

    const seoDescription = isGuestView
        ? t("seo.guest.description")
        : t("seo.user.description", { name: displayName });

    return (
        <>
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <link rel="canonical" href={canonicalUrl} />
                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:url" content={canonicalUrl} />
                {avatarUrl && <meta property="og:image" content={avatarUrl} />}
                {/* Twitter */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDescription} />
                {avatarUrl && <meta name="twitter:image" content={avatarUrl} />}
            </Helmet>

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
                                <Wrapper
                                    photoUrl={avatarUrl}
                                    username={displayUsername}
                                    fullname={displayName}
                                />
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
        </>
    );
};
export default IdentityGatePage;

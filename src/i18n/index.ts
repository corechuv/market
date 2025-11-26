// src/i18n/index.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getInitialLanguage } from "../utils/lang/lang";

// FOOTER
import enFooter from "./locales/en/footer.json";
import deFooter from "./locales/de/footer.json";
import ruFooter from "./locales/ru/footer.json";

// AUTH
import enAuth from "./locales/en/auth.json";
import deAuth from "./locales/de/auth.json";
import ruAuth from "./locales/ru/auth.json";

// CHEKOUT
import enCheckout from "./locales/en/checkout.json";
import deCheckout from "./locales/de/checkout.json";
import ruCheckout from "./locales/ru/checkout.json";

// SUMMARY
import enSummary from "./locales/en/summary.json";
import deSummary from "./locales/de/summary.json";
import ruSummary from "./locales/ru/summary.json";

// CART
import enCart from "./locales/en/cart.json";
import deCart from "./locales/de/cart.json";
import ruCart from "./locales/ru/cart.json";

// IDENTITY GATE
import enIdentityGate from "./locales/en/identityGate.json";
import deIdentityGate from "./locales/de/identityGate.json";
import ruIdentityGate from "./locales/ru/identityGate.json";

// PAYMENT
import enPayment from "./locales/en/payment.json";
import dePayment from "./locales/de/payment.json";
import ruPayment from "./locales/ru/payment.json";

// SUCCESS
import enSuccess from "./locales/en/success.json";
import deSuccess from "./locales/de/success.json";
import ruSuccess from "./locales/ru/success.json";

// NOT FOUND
import enNotFound from "./locales/en/notFound.json";
import deNotFound from "./locales/de/notFound.json";
import ruNotFound from "./locales/ru/notFound.json";

// SEARCH
import enSearch from "./locales/en/search.json";
import deSearch from "./locales/de/search.json";
import ruSearch from "./locales/ru/search.json";

// SETTINGS
import enSettings from "./locales/en/settings.json";
import deSettings from "./locales/de/settings.json";
import ruSettings from "./locales/ru/settings.json";

// CATALOG
import enCatalog from "./locales/en/catalog.json";
import deCatalog from "./locales/de/catalog.json";
import ruCatalog from "./locales/ru/catalog.json";

// HOME
import enHome from "./locales/en/home.json";
import deHome from "./locales/de/home.json";
import ruHome from "./locales/ru/home.json";

const initialLang = getInitialLanguage();

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                footer: enFooter,
                auth: enAuth,
                summary: enSummary,
                checkout: enCheckout,
                cart: enCart,
                identityGate: enIdentityGate,
                payment: enPayment,
                success: enSuccess,
                notFound: enNotFound,
                search: enSearch,
                settings: enSettings,
                catalog: enCatalog,
                home: enHome
            },
            de: {
                footer: deFooter,
                auth: deAuth,
                summary: deSummary,
                checkout: deCheckout,
                cart: deCart,
                identityGate: deIdentityGate,
                payment: dePayment,
                success: deSuccess,
                notFound: deNotFound,
                search: deSearch,
                settings: deSettings,
                catalog: deCatalog,
                home: deHome
            },
            ru: {
                footer: ruFooter,
                auth: ruAuth,
                summary: ruSummary,
                checkout: ruCheckout,
                cart: ruCart,
                identityGate: ruIdentityGate,
                payment: ruPayment,
                success: ruSuccess,
                notFound: ruNotFound,
                search: ruSearch,
                settings: ruSettings,
                catalog: ruCatalog,
                home: ruHome
            },
        },
        lng: initialLang,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;

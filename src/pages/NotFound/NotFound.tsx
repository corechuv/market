// src/pages/NotFound/NotFound.tsx
import React from "react";
import s from "./NotFound.module.scss";
import Page from "../../components/UI/Page/Page";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

type NotFoundProps = {
  /** Куда ведёт кнопка "На главную" */
  homeHref?: string;
  /** Куда вести "Сообщить о проблеме" (mailto: или URL) */
  supportHref?: string;
  /** Кастомный заголовок */
  title?: string;
  /** Короткое описание под заголовком */
  description?: string;
};

const NotFound: React.FC<NotFoundProps> = ({
  homeHref = "/",
  supportHref,
  title,
  description,
}) => {
  const { t } = useTranslation("notFound");

  const finalTitle = title ?? t("title");
  const finalDescription = description ?? t("description");

  // SEO-тексты: отдельно, чтобы можно было локализовать шаблон
  const seoTitle = t("seo.title", { title: finalTitle });
  const seoDescription = t("seo.description", { description: finalDescription });

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        {/* 404 страницы обычно не индексируем */}
        <meta name="robots" content="noindex,follow" />
      </Helmet>

      <Page>
        <section
          className={s.not}
          aria-live="polite"
          aria-label={t("ariaLabel")}
        >
          <div className={s.not__code} aria-hidden>
            <span>4</span>
            <span>0</span>
            <span>4</span>
          </div>
          <div className={s.not__what}>
            <h1 className={s["not__what--title"]}>{finalTitle}</h1>
            <p className={s["not__what--description"]}>{finalDescription}</p>
          </div>
          <div className={s.not__actions}>
            <a href={homeHref}>{t("actions.home")}</a>
            {supportHref && (
              <a href={supportHref}>{t("actions.report")}</a>
            )}
          </div>
        </section>
      </Page>
    </>
  );
};

export default NotFound;

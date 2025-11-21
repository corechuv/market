// src/pages/NotFound/NotFound.tsx
import React from "react";
import s from "./NotFound.module.scss";
import Page from "../../components/UI/Page/Page";

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
  title = "Page not found",
  description = "It looks like this page doesn't exist.",
}) => {

  return (
    <Page>
      <section className={s.not} aria-live="polite" aria-label="Page not found">
        <div className={s.not__code} aria-hidden>
          <span>4</span>
          <span>0</span>
          <span>4</span>
        </div>
        <div className={s.not__what}>
          <h1 className={s["not__what--title"]}>{title}</h1>
          <p className={s["not__what--description"]}>{description}</p>
        </div>
        <div className={s.not__actions}>
          <a href={homeHref}>
            Home
          </a>
          {supportHref && (
            <a href={supportHref}>
              Report a problem
            </a>
          )}
        </div>
      </section>
    </Page>
  );
};

export default NotFound;

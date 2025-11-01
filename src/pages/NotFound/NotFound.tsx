import React from "react";
import s from "./NotFound.module.scss";
import Button from "../../components/UI/Button";
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
  description = "It looks like this page doesn't exist. Go back to the main page or take a step back.",
}) => {
  const goBack = () => {
    if (typeof window === "undefined") return;
    if (window.history.length > 1) window.history.back();
    else window.location.assign(homeHref);
  };

  return (
    <Page>
      <main className={s.wrapper} role="main" aria-label="Page not found">
        <section className={s.card} aria-live="polite">
          <div className={s.code} aria-hidden>
            <span>4</span>
            <span>0</span>
            <span>4</span>
          </div>

          <h1 className={s.title}>{title}</h1>
          <p className={s.subtitle}>{description}</p>

          <div className={s.actions}>
            <a className={`${s.btn} ${s.primary}`} href={homeHref}>
              Home
            </a>
            <Button size="small" variant="secondary" type="button" onClick={goBack}>
              Back
            </Button>
            {supportHref && (
              <a className={`${s.btn} ${s.ghost}`} href={supportHref}>
                Report a problem
              </a>
            )}
          </div>
        </section>
      </main>
    </Page>
  );
};

export default NotFound;

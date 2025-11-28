// src/pages/Help/ru/FAQPage.ru.tsx
import "react"
import { Helmet } from "react-helmet-async"
import Page from "../../../components/UI/Page/Page"
import s from "../Help.module.scss"
import Accordion from "../../../components/UI/Accordion"

import { faqItemsRu } from "../../../data/information/faq.ru"

export default function FAQPageRu() {
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItemsRu.map((item) => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answerText,
            },
        })),
    };

    const title = "FAQ – Частые вопросы | Dashedo";
    const description =
        "Ответы на частые вопросы о Dashedo: аккаунт, заказы, доставка, возвраты и технические вопросы.";

    return (
        <>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href="https://dashedo.com/help/faq" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content="https://dashedo.com/help/faq" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
            </Helmet>
            <Page>
                <div className={s.content}>
                    <nav aria-label="Хлебные крошки">
                        <a href="/">Главная</a> &nbsp;/&nbsp;{" "}
                        <a href="/help">Помощь &amp; поддержка</a> &nbsp;/&nbsp; <span>FAQ</span>
                    </nav>

                    <h1 className={s.content__title}>FAQ – Часто задаваемые вопросы</h1>
                    <p>
                        <strong>Последнее обновление:</strong> 11.11.2025
                    </p>

                    <p>
                        Здесь вы найдёте ответы на частые вопросы о Dashedo. Не нашли нужную
                        информацию? <a href="/help/contact">Свяжитесь с нами</a>.
                    </p>

                    <section className={s.content__accordion}>
                        {faqItemsRu.map((item) => (
                            <Accordion key={item.id} title={item.question}>
                                {item.answerContent}
                            </Accordion>
                        ))}
                    </section>

                    <p>
                        Другие разделы: <a href="/help/contact">Контакты</a> ·{" "}
                        <a href="/legal/terms">Условия использования</a> ·{" "}
                        <a href="/legal/privacy">Конфиденциальность</a>
                    </p>

                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify(faqJsonLd),
                        }}
                    />
                </div>
            </Page>
        </>
    );
}

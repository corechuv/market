// src/pages/Help/ru/ShippingPage.ru.tsx
import "react"
import { Helmet } from "react-helmet-async"
import Page from "../../../components/UI/Page/Page"
import s from "../Help.module.scss"

export default function ShippingPageRu() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Предоставление и доставка (цифровая)",
        "url": "https://dashedo.com/help/shipping",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://dashedo.com/" },
                { "@type": "ListItem", "position": 2, "name": "Помощь и поддержка", "item": "https://dashedo.com/help" },
                { "@type": "ListItem", "position": 3, "name": "Предоставление и доставка", "item": "https://dashedo.com/help/shipping" }
            ]
        }
    };

    const title = "Предоставление доступа (цифровая поставка) – Помощь | Dashedo";
    const description =
        "Как предоставляется доступ к аккаунту Dashedo, что делать, если письмо не пришло, и как устроены доступность сервиса и счета.";

    return (
        <>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href="https://dashedo.com/help/shipping" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content="https://dashedo.com/help/shipping" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
            </Helmet>
            <Page>
                <div className={s.content}>
                    <nav aria-label="Хлебные крошки">
                        <a href="/">Главная</a> &nbsp;/&nbsp; <a href="/help">Помощь &amp; поддержка</a> &nbsp;/&nbsp; <span>Предоставление &amp; доставка</span>
                    </nav>

                    <h1 className={s.content__title}>Предоставление &amp; доставка (цифровая)</h1>
                    <p><strong>Последнее обновление:</strong> 11.11.2025</p>

                    <h2>Предоставление доступа</h2>
                    <p>
                        После успешного оформления заказа вы получаете <strong>мгновенный доступ</strong> к Dashedo.
                        Письмо активации с подтверждающей ссылкой отправляется на e-mail, привязанный к вашему аккаунту.
                    </p>

                    <h2>Если письмо не пришло</h2>
                    <ul>
                        <li>Проверьте <strong>папку «Спам» / «Нежелательная почта»</strong> и добавьте <em>no-reply@dashedo.com</em> в список доверенных отправителей.</li>
                        <li>Убедитесь, что указанный адрес электронной почты корректен.</li>
                        <li>При необходимости свяжитесь со <a href="/help/contact">службой поддержки</a> — мы с радостью поможем.</li>
                    </ul>

                    <h2>Регионы &amp; доступность</h2>
                    <p>
                        В общем случае Dashedo можно использовать по всему миру. Ограничения могут возникать из-за местных
                        правовых требований или особенностей интеграций с партнёрами.
                    </p>

                    <h2>Уровень сервиса &amp; обслуживание</h2>
                    <p>
                        Мы стремимся обеспечивать высокую доступность сервиса. Плановые работы по обслуживанию, насколько
                        возможно, объявляются заранее. Актуальные уведомления вы найдёте в продукте или получите через поддержку.
                    </p>

                    <h2>Выставление счетов</h2>
                    <p>
                        Счета предоставляются в цифровом виде и могут быть загружены в личном кабинете.
                        По запросу мы также можем отправить PDF-копию по e-mail.
                    </p>

                    <p>
                        Другие разделы: <a href="/help/faq">FAQ</a> ·{" "}
                        <a href="/help/returns-refunds">Возвраты &amp; возмещения</a> ·{" "}
                        <a href="/help/contact">Контакты</a>
                    </p>

                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                    />
                </div>
            </Page>
        </>
    );
}

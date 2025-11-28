// src/pages/Help/ru/ReturnsRefundsPage.ru.tsx
import "react"
import { Helmet } from "react-helmet-async"
import Page from "../../../components/UI/Page/Page"
import s from "../Help.module.scss"

export default function ReturnsRefundsPageRu() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Возвраты и возмещения",
        "url": "https://dashedo.com/help/returns-refunds",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://dashedo.com/" },
                { "@type": "ListItem", "position": 2, "name": "Помощь и поддержка", "item": "https://dashedo.com/help" },
                { "@type": "ListItem", "position": 3, "name": "Возвраты и возмещения", "item": "https://dashedo.com/help/returns-refunds" }
            ]
        }
    };

    const title = "Возвраты и возмещения – Помощь | Dashedo";
    const description =
        "Информация о возвратах, праве на отказ от договора и возмещениях для клиентов Dashedo.";

    return (
        <>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href="https://dashedo.com/help/returns-refunds" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content="https://dashedo.com/help/returns-refunds" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
            </Helmet>
            <Page>
                <div className={s.content}>
                    <nav aria-label="Хлебные крошки">
                        <a href="/">Главная</a> &nbsp;/&nbsp; <a href="/help">Помощь &amp; поддержка</a> &nbsp;/&nbsp; <span>Возвраты &amp; возмещения</span>
                    </nav>

                    <h1 className={s.content__title}>Возвраты &amp; возмещения</h1>
                    <p><strong>Последнее обновление:</strong> 11.11.2025</p>

                    <h2>Право на отказ для потребителей (ЕС)</h2>
                    <p>
                        Потребители имеют право расторгнуть договор на оказание цифровых услуг в течение 14&nbsp;дней без указания причин.
                        Отсчёт срока начинается с дня заключения договора. Дополнительную информацию вы найдёте в наших{" "}
                        <a href="/legal/terms">Условиях использования</a>.
                    </p>
                    <p>
                        <em>Примечание по цифровому контенту/услугам:</em> Если вы просите нас начать оказание услуги до
                        истечения срока отказа и прямо подтверждаете это, право на отказ может утратиться, как только
                        услуга будет полностью оказана.
                    </p>

                    <h2>Как запросить возврат средств</h2>
                    <ol>
                        <li>
                            Отправьте письмо на <a href="mailto:support@dashedo.com">support@dashedo.com</a> с темой
                            «Возврат средств».
                        </li>
                        <li>
                            Укажите свою <strong>номер счёта/инвойса</strong>, <strong>e-mail аккаунта</strong> и краткое обоснование.
                        </li>
                        <li>
                            Наша команда рассмотрит ваш запрос в соответствии с{" "}
                            <a href="/legal/terms">Условиями использования</a> и сообщит решение по e-mail.
                        </li>
                    </ol>

                    <h2>Сроки и способ выплаты</h2>
                    <p>
                        Одобренные возвраты средств мы, как правило, осуществляем в течение 5–10 рабочих дней на исходный
                        способ оплаты. Сроки обработки зависят от банков.
                    </p>

                    <h2>Исключения &amp; ограничения</h2>
                    <ul>
                        <li>
                            Для <strong>B2B-договоров</strong> могут действовать иные условия, указанные в коммерческом
                            предложении и/или Условиях использования.
                        </li>
                        <li>
                            В случаях <strong>злоупотребления</strong> или <strong>нарушения Условий использования</strong>{" "}
                            возврат средств может быть отклонён.
                        </li>
                        <li>
                            Для <strong>скидок и специальных акций</strong> действуют условия, указанные в рамках
                            соответствующей акции.
                        </li>
                    </ul>

                    <p>
                        Нужна помощь? <a href="/help/contact">Свяжитесь с нами</a>. Дополнительно:{" "}
                        <a href="/legal/privacy">Конфиденциальность</a>.
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

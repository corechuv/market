// src/pages/Help/ru/FAQPage.ru.tsx
import "react";
import Page from "../../../components/UI/Page/Page";
import s from "../Help.module.scss";
import Logo from "../../../components/Footer/Logo";

export default function FAQPageRu() {
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Что такое Dashedo и для кого он подходит?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Dashedo — это облачный программный сервис (SaaS) для ⟨краткое описание вашего продукта⟩. Подходит для ⟨целевых аудиторий⟩."
                }
            },
            {
                "@type": "Question",
                "name": "Есть ли бесплатный пробный период?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Да, вы можете протестировать Dashedo без обязательств. Подробности о продолжительности и функционале вы найдёте на странице «Цены»."
                }
            },
            {
                "@type": "Question",
                "name": "Как изменить или отменить мой тариф?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Вы можете в любое время изменить или отменить тариф в разделе аккаунта. Изменения вступают в силу со следующего расчётного периода в соответствии с нашими Условиями использования."
                }
            },
            {
                "@type": "Question",
                "name": "Какие способы оплаты поддерживаются?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Мы поддерживаем распространённые способы оплаты через ⟨Stripe/Adyen⟩. Счета доступны для загрузки в вашем аккаунте."
                }
            },
            {
                "@type": "Question",
                "name": "Как обеспечивается безопасность моих данных?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Мы используем TLS-шифрование, ролевой контроль доступа и регулярные резервные копии. Подробности можно найти в нашей политике конфиденциальности."
                }
            },
            {
                "@type": "Question",
                "name": "Предлагаете ли вы интеграции с другими инструментами?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Да, доступны интеграции с ⟨пример инструментов⟩. Актуальный список вы найдёте на странице «Возможности»."
                }
            },
            {
                "@type": "Question",
                "name": "Как быстро я получу доступ после оформления заказа?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Как правило, доступ предоставляется сразу. Если вы не получили письмо активации, проверьте папку «Спам» или свяжитесь со службой поддержки."
                }
            },
            {
                "@type": "Question",
                "name": "Как я могу запросить возврат средств?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Информацию об отмене и возвратах вы найдёте в разделе «Возвраты и возмещения». При вопросах обратитесь в службу поддержки."
                }
            }
        ]
    };

    return (
        <Page>
            <div className={s.content}>
                <Logo />

                <nav aria-label="Хлебные крошки">
                    <a href="/">Главная</a> &nbsp;/&nbsp; <a href="/help">Помощь &amp; поддержка</a> &nbsp;/&nbsp; <span>FAQ</span>
                </nav>

                <h1 className={s.content__title}>FAQ – Часто задаваемые вопросы</h1>
                <p><strong>Последнее обновление:</strong> 11.11.2025</p>

                <p>
                    Здесь вы найдёте ответы на частые вопросы о Dashedo. Не нашли нужную информацию?{" "}
                    <a href="/help/contact">Свяжитесь с нами</a>.
                </p>

                <details>
                    <summary><strong>Что такое Dashedo и для кого он подходит?</strong></summary>
                    <p>
                        Dashedo — это облачный программный сервис (SaaS) для ⟨краткое описание продукта⟩.
                        Идеально подходит для ⟨целевых аудиторий⟩.
                    </p>
                </details>

                <details>
                    <summary><strong>Есть ли бесплатный пробный период?</strong></summary>
                    <p>
                        Да — объём и длительность указаны на странице{" "}
                        <a href="/pricing">Цены</a>. Вы можете отменить пробный период в любое время до его окончания.
                    </p>
                </details>

                <details>
                    <summary><strong>Как изменить или отменить мой тариф?</strong></summary>
                    <p>
                        В личном кабинете вы можете гибко настроить свой тариф. Действуют условия,
                        указанные в наших <a href="/legal/terms">Условиях использования</a>.
                    </p>
                </details>

                <details>
                    <summary><strong>Какие способы оплаты поддерживаются?</strong></summary>
                    <p>
                        Мы принимаем платежи через ⟨Stripe/Adyen⟩ (например, банковские карты, SEPA).
                        Счета вы найдёте в своём аккаунте.
                    </p>
                </details>

                <details>
                    <summary><strong>Насколько безопасны мои данные?</strong></summary>
                    <p>
                        Шифрование, контроль доступа, резервное копирование и мониторинг — часть нашего стандарта.
                        Подробности: <a href="/legal/privacy">политика конфиденциальности</a>.
                    </p>
                </details>

                <details>
                    <summary><strong>Есть ли интеграции?</strong></summary>
                    <p>
                        Да, в том числе с ⟨пример инструментов⟩. Подробнее — в разделе{" "}
                        <a href="/features">Возможности</a>.
                    </p>
                </details>

                <details>
                    <summary><strong>Как я получу доступ после заказа?</strong></summary>
                    <p>
                        Обычно доступ предоставляется сразу по письму активации. При необходимости проверьте папку «Спам».
                        Дополнительно: <a href="/help/shipping">Предоставление &amp; доставка</a>.
                    </p>
                </details>

                <details>
                    <summary><strong>Как запросить возврат средств?</strong></summary>
                    <p>
                        Условия и требования описаны в разделе{" "}
                        <a href="/help/returns-refunds">Возвраты &amp; возмещения</a>.
                    </p>
                </details>

                <p>
                    Другие разделы: <a href="/help/contact">Контакты</a> ·{" "}
                    <a href="/legal/terms">Условия использования</a> ·{" "}
                    <a href="/legal/privacy">Конфиденциальность</a>
                </p>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
                />
            </div>
        </Page>
    );
}

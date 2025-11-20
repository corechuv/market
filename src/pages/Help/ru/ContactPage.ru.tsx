// src/pages/Help/ru/ContactPage.ru.tsx
import "react";
import Page from "../../../components/UI/Page/Page";
import s from "../Help.module.scss";
import Logo from "../../../components/Footer/Logo";

export default function ContactPageRu() {
    const orgJsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "⟨Dashedo GmbH⟩",
        "url": "https://dashedo.com/",
        "contactPoint": [
            {
                "@type": "ContactPoint",
                "contactType": "customer support",
                "telephone": "+49 ⟨30⟩ ⟨1234567⟩",
                "email": "support@dashedo.com",
                "areaServed": "DE, AT, CH, EU",
                "availableLanguage": ["de", "en"],
                "hoursAvailable": {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
                    "opens": "09:00",
                    "closes": "18:00"
                }
            }
        ]
    };

    const pageJsonLd = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Контакты",
        "url": "https://dashedo.com/help/contact",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://dashedo.com/" },
                { "@type": "ListItem", "position": 2, "name": "Помощь и поддержка", "item": "https://dashedo.com/help" },
                { "@type": "ListItem", "position": 3, "name": "Контакты", "item": "https://dashedo.com/help/contact" }
            ]
        }
    };

    return (
        <Page>
            <section className={s.content} lang="ru">
                <Logo />

                <nav aria-label="Хлебные крошки">
                    <a href="/">Главная</a> &nbsp;/&nbsp; <a href="/help">Помощь &amp; поддержка</a> &nbsp;/&nbsp; <span>Контакты</span>
                </nav>

                <h1 className={s.content__title}>Контакты</h1>
                <p><strong>Последнее обновление:</strong> 11.11.2025</p>

                <h2>Как с нами связаться</h2>
                <p>
                    Наша команда поддержки на связи с понедельника по пятницу, с 09:00 до 18:00 (CET/CEST).
                    Обычно мы отвечаем в течение 24&nbsp;часов.
                </p>
                <ul>
                    <li><strong>E-mail:</strong> <a href="mailto:support@dashedo.com">support@dashedo.com</a></li>
                    <li><strong>Телефон:</strong> <a href="tel:+49⟨30⟩⟨1234567⟩">+49 ⟨30⟩ ⟨1234567⟩</a></li>
                    <li><strong>Адрес (юридический):</strong> ⟨Dashedo GmbH, Musterstraße 1, 10115 Berlin⟩</li>
                </ul>

                <h2>Быстрее к решению</h2>
                <ol>
                    <li>Загляните в наш раздел <a href="/help/faq">FAQ</a> — многие вопросы уже там разобраны.</li>
                    <li>Кратко и чётко опишите проблему и при необходимости приложите скриншоты, ID логов или ссылки.</li>
                    <li>Укажите вашу <em>аккаунт-почту</em> и — если есть — <em>номер тикета или заказа</em>.</li>
                </ol>

                <h2>Защита данных при обращении в поддержку</h2>
                <p>
                    Мы обрабатываем обращения в поддержку в соответствии со ст.&nbsp;6 п.&nbsp;1 лит.&nbsp;b/f GDPR.
                    Подробности — в нашей
                    <a href="/legal/privacy"> политике конфиденциальности</a>.
                </p>

                <p>
                    Дополнительная помощь: <a href="/help/returns-refunds">Возвраты и возмещения</a>,{" "}
                    <a href="/help/shipping">Предоставление &amp; доставка</a>.
                </p>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
                />
            </section>
        </Page>
    );
}

// src/pages/About/ru/AboutPage.ru.tsx
import "react";
import Page from "../../../components/UI/Page/Page";
import s from "../About.module.scss";
import Logo from "../../../components/Footer/Logo";

export default function AboutPageRu() {
    const orgJsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Dashedo GmbH",
        "url": "https://dashedo.com/",
        "logo": "https://dashedo.com/dashedo-logo.edge-height120-tracking30.svg",
        "foundingDate": "2023-01-01",
        "founders": [
            { "@type": "Person", "name": "Jane Doe" },
            { "@type": "Person", "name": "John Doe" }
        ],
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Example Street 1",
            "postalCode": "10115",
            "addressLocality": "Berlin",
            "addressCountry": "DE"
        },
        "sameAs": [
            "https://www.linkedin.com/company/dashedo",
            "https://x.com/dashedo"
        ]
    };

    const pageJsonLd = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "О нас",
        "url": "https://dashedo.com/about",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Главная",
                    "item": "https://dashedo.com/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "О нас",
                    "item": "https://dashedo.com/about"
                }
            ]
        }
    };

    return (
        <Page>
            <div className={s.content}>

                <Logo />

                <nav aria-label="Хлебные крошки">
                    <a href="/">Главная</a> &nbsp;/&nbsp; <span>О нас</span>
                </nav>

                <h1 className={s.content__title}>О нас</h1>
                <p>
                    <strong>Последнее обновление:</strong> 11.11.2025
                </p>

                <h2>Наша миссия</h2>
                <p>
                    Мы создаём программное обеспечение, которое радикально упрощает
                    сложные рабочие процессы. С Dashedo мы помогаем командам
                    проектировать, автоматизировать и отслеживать критически важные
                    процессы — быстро, безопасно и масштабируемо.
                </p>

                <h2>Что мы делаем</h2>
                <p>
                    Dashedo — это облачный SaaS-сервис для автоматизации рабочих
                    процессов и аналитики. Компании используют нас, чтобы
                    автоматизировать процессы, лучше понимать данные и измеримо
                    улучшать результаты. Подробнее в разделах{" "}
                    <a href="/features">Возможности</a>,{" "}
                    <a href="/solutions">Решения</a> и{" "}
                    <a href="/pricing">Тарифы</a>.
                </p>

                <h2>Наши ценности</h2>
                <ul>
                    <li>
                        <strong>Ценность для клиента — в приоритете:</strong>{" "}
                        каждое решение оценивается через реальные сценарии
                        использования.
                    </li>
                    <li>
                        <strong>Простота:</strong> меньше кликов, более понятные
                        интерфейсы, лучше результаты.
                    </li>
                    <li>
                        <strong>Безопасность и защита данных:</strong>{" "}
                        соответствие GDPR, дата-центры в ЕС, принцип
                        наименьших привилегий.
                    </li>
                    <li>
                        <strong>Ownership:</strong> небольшие автономные команды
                        с чёткой зоной ответственности.
                    </li>
                    <li>
                        <strong>Прозрачность:</strong> открытая коммуникация —
                        и внутри компании, и снаружи.
                    </li>
                </ul>

                <h2>Цифры и факты</h2>
                <ul>
                    <li>Год основания: 2023, Берлин</li>
                    <li>Клиенты в 10+ странах</li>
                    <li>Доступность: 99,9% (за последние 12 месяцев)</li>
                    <li>Размер команды: 15+ человек (remote-first, европейские часовые пояса)</li>
                </ul>

                <h2>Команда и история создания</h2>
                <p>
                    Dashedo основана продуктовой и инженерной командой с
                    сильной экспертизой в области developer experience и
                    измеримого бизнес-эффекта. Мы совмещаем глубокое
                    доменное знание с первоклассной инженерией, чтобы
                    создавать надёжные и масштабируемые решения.
                </p>

                <h2>Ключевые этапы</h2>
                <ul>
                    <li>
                        <strong>2023:</strong> основание компании, запуск первого MVP
                    </li>
                    <li>
                        <strong>2024:</strong> публичный запуск и первые Enterprise-клиенты
                    </li>
                    <li>
                        <strong>2025:</strong> крупный релиз продукта и расширение
                        экосистемы интеграций
                    </li>
                </ul>

                <p>
                    Хотите помочь сформировать будущее автоматизации рабочих
                    процессов? Загляните в раздел{" "}
                    <a href="/about/careers">Вакансии</a> или напишите нам
                    через <a href="/help/contact">форму обратной связи</a>.
                    Для прессы — отдельный раздел{" "}
                    <a href="/about/press">Пресса</a>.
                </p>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
                />
            </div>
        </Page>
    );
}

// src/pages/Legal/ru/SitemapPage.ru.tsx
import "react";
import Page from "../../../components/UI/Page/Page";
import s from "../Legal.module.scss";

export default function SitemapPageRu() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "HTML-карта сайта",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "url": "https://dashedo.com/" },
            { "@type": "ListItem", "position": 2, "url": "https://dashedo.com/features" },
            { "@type": "ListItem", "position": 3, "url": "https://dashedo.com/pricing" },
            { "@type": "ListItem", "position": 4, "url": "https://dashedo.com/solutions" },
            { "@type": "ListItem", "position": 5, "url": "https://dashedo.com/about" },
            { "@type": "ListItem", "position": 6, "url": "https://dashedo.com/contact" },
            { "@type": "ListItem", "position": 7, "url": "https://dashedo.com/blog" },
            { "@type": "ListItem", "position": 8, "url": "https://dashedo.com/help" },
            { "@type": "ListItem", "position": 9, "url": "https://dashedo.com/legal/imprint" },
            { "@type": "ListItem", "position": 10, "url": "https://dashedo.com/legal/privacy" },
            { "@type": "ListItem", "position": 11, "url": "https://dashedo.com/legal/cookies" },
            { "@type": "ListItem", "position": 12, "url": "https://dashedo.com/legal/terms" }
        ]
    };

    return (
        <Page>
            <div className={s.content}>
                <nav aria-label="Хлебные крошки">
                    <a href="/">Главная</a> &nbsp;/&nbsp; <a href="/legal">Правовая информация</a> &nbsp;/&nbsp; <span>Карта сайта</span>
                </nav>

                <h1 className={s.content__title}>Карта сайта</h1>
                <p><strong>Последнее обновление:</strong> 11.11.2025</p>

                <h2>Основные разделы</h2>
                <ul>
                    <li><a href="/">Главная</a></li>
                    <li><a href="/features">Возможности</a></li>
                    <li><a href="/solutions">Решения</a></li>
                    <li><a href="/pricing">Цены</a></li>
                    <li><a href="/about">О нас</a></li>
                    <li><a href="/contact">Контакты</a></li>
                    <li><a href="/blog">Блог</a></li>
                    <li><a href="/help">Помощь &amp; поддержка</a></li>
                </ul>

                <h2>Правовая информация</h2>
                <ul>
                    <li><a href="/legal/imprint">Выходные данные (Impressum)</a></li>
                    <li><a href="/legal/privacy">Политика конфиденциальности</a></li>
                    <li><a href="/legal/cookies">Политика Cookie</a></li>
                    <li><a href="/legal/terms">Условия использования</a></li>
                </ul>

                <p>
                    Примечание: XML-карта сайта для поисковых систем доступна по адресу <code>/sitemap.xml</code>.
                </p>

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </div>
        </Page>
    );
}

// src/pages/About/ru/PressPage.ru.tsx
import "react"
import { Helmet } from "react-helmet-async"
import Page from "../../../components/UI/Page/Page"
import s from "../About.module.scss"

export default function PressPageRu() {
    const orgJsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "⟨Dashedo GmbH⟩",
        "url": "https://dashedo.com/",
        "logo": "https://dashedo.com/⟨pfad-zum-logo⟩.png",
        "contactPoint": [{
            "@type": "ContactPoint",
            "contactType": "media relations",
            "email": "press@dashedo.com",
            "telephone": "+49 ⟨30⟩ ⟨1234567⟩",
            "areaServed": "DE, AT, CH, EU",
            "availableLanguage": ["de", "en"]
        }]
    };

    const pageJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Пресса",
        "url": "https://dashedo.com/about/press",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://dashedo.com/" },
                { "@type": "ListItem", "position": 2, "name": "О нас", "item": "https://dashedo.com/about" },
                { "@type": "ListItem", "position": 3, "name": "Пресса", "item": "https://dashedo.com/about/press" }
            ]
        }
    };

    return (
        <>
            <Helmet>
                <title>Пресса – Dashedo</title>
                <meta
                    name="description"
                    content="Пресс-материалы Dashedo: краткая информация о компании, boilerplate-текст, контакты для СМИ и пресс-кит."
                />
                <link rel="canonical" href="https://dashedo.com/about/press" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Пресса – Dashedo" />
                <meta
                    property="og:description"
                    content="Раздел для СМИ: факты о Dashedo, пресс-материалы и контакт для журналистов."
                />
                <meta property="og:url" content="https://dashedo.com/about/press" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="Пресса – Dashedo" />
                <meta
                    name="twitter:description"
                    content="Пресс-ресурсы Dashedo, boilerplate и контакт для медиа."
                />
            </Helmet>
            <Page>
                <div className={s.content}>
                    <nav aria-label="Хлебные крошки">
                        <a href="/">Главная</a> &nbsp;/&nbsp; <a href="/about">О нас</a> &nbsp;/&nbsp; <span>Пресса</span>
                    </nav>

                    <h1 className={s.content__title}>Пресса</h1>
                    <p><strong>Последнее обновление:</strong> 11.11.2025</p>

                    <h2>Краткий профиль</h2>
                    <p>
                        ⟨Dashedo⟩ — это ⟨немецкая⟩ SaaS-платформа для ⟨однострочное описание ценности/продукта⟩.
                        Компании используют Dashedo, чтобы достигать ⟨ключевые результаты⟩ быстрее и с понятными метриками.
                    </p>

                    <h2>Цифры одним взглядом</h2>
                    <ul>
                        <li>Основана: ⟨год⟩ · Штаб-квартира: Берлин</li>
                        <li>Клиенты: ⟨X⟩+ компаний в ⟨Y⟩ странах</li>
                        <li>Финансирование/статус: ⟨bootstrapped/finanziert⟩</li>
                    </ul>

                    <h2>Пресс-контакт</h2>
                    <p>
                        <strong>Media Relations</strong><br />
                        E-mail: <a href="mailto:press@dashedo.com">press@dashedo.com</a><br />
                        Телефон: +49 ⟨30⟩ ⟨1234567⟩
                    </p>

                    <h2>Пресс-материалы</h2>
                    <ul>
                        <li>
                            <a href="/assets/presskit.zip">Пресс-кит (ZIP)</a> — логотипы, скриншоты, изображения продукта
                        </li>
                        <li>
                            <a href="/assets/brand-guidelines.pdf">Brand Guidelines (PDF)</a>
                        </li>
                        <li>
                            <a href="https://dashedo.com/⟨pressebilder-galerie⟩">Галерея пресс-изображений</a>
                        </li>
                    </ul>

                    <h2>Boilerplate</h2>
                    <p>
                        <em>О Dashedo:</em> Dashedo — это облачная платформа для ⟨ценностное предложение⟩.
                        Компания со штаб-квартирой в Берлине помогает командам достигать ⟨основной результат/пользу⟩ —
                        надёжно, масштабируемо и в полном соответствии с требованиями GDPR. Подробнее на{" "}
                        <a href="https://dashedo.com/">dashedo.com</a>.
                    </p>

                    <h2>Избранные упоминания</h2>
                    <ul>
                        <li>⟨Медиа/издание⟩ — «⟨цитата/заголовок⟩» (⟨дата⟩)</li>
                        <li>⟨Медиа/издание⟩ — «⟨цитата/заголовок⟩» (⟨дата⟩)</li>
                        <li>Обновления в собственном newsroom: <a href="/blog">блог</a></li>
                    </ul>

                    <h2>Правила использования бренда и логотипов</h2>
                    <ul>
                        <li>Пожалуйста, используйте только файлы, предоставленные в пресс-ките.</li>
                        <li>Соблюдайте минимальные размеры и свободное пространство (см. Brand Guidelines).</li>
                        <li>Не изменяйте цвет, форму или пропорции логотипа.</li>
                    </ul>

                    <p>
                        Больше информации: <a href="/features">Функции</a> ·{" "}
                        <a href="/solutions">Решения</a> ·{" "}
                        <a href="/help/contact">Контакты</a>
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
        </>
    );
}

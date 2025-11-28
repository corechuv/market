// src/pages/About/ru/CareersPage.ru.tsx
import "react"
import { Helmet } from "react-helmet-async"
import Page from "../../../components/UI/Page/Page"
import s from "../About.module.scss"

export default function CareersPageRu() {
    const pageJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Карьера",
        "url": "https://dashedo.com/about/careers",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://dashedo.com/" },
                { "@type": "ListItem", "position": 2, "name": "О нас", "item": "https://dashedo.com/about" },
                { "@type": "ListItem", "position": 3, "name": "Карьера", "item": "https://dashedo.com/about/careers" }
            ]
        }
    };

    // Пример вакансий для SEO (JSON-LD):
    const jobsJsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": "Frontend Engineer (m/f/d)",
            "datePosted": "2025-11-11",
            "employmentType": "FULL_TIME",
            "hiringOrganization": {
                "@type": "Organization",
                "name": "Dashedo GmbH",
                "sameAs": "https://dashedo.com/"
            },
            "industry": "Software",
            "jobLocationType": "TELECOMMUTE",
            "applicantLocationRequirements": { "@type": "Country", "name": "Germany" },
            "jobLocation": {
                "@type": "Place",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Berlin",
                    "addressCountry": "DE"
                }
            },
            "description": "Разрабатывай современные интерфейсы для Dashedo. Технологии: ⟨React/TypeScript/Tailwind⟩.",
            "responsibilities": "Разработка UI, производительность, тесты, code review.",
            "qualifications": "3+ лет опыта, отличные знания React/TypeScript.",
            "incentiveCompensation": "⟨vs.⟩",
            "baseSalary": {
                "@type": "MonetaryAmount",
                "currency": "EUR",
                "value": {
                    "@type": "QuantitativeValue",
                    "value": "⟨xx⟩",
                    "unitText": "YEAR"
                }
            },
            "applicantLocationRequirementsDescription": "Удалённо из Германии / в европейских часовых поясах."
        },
        {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": "Account Executive DACH (m/f/d)",
            "datePosted": "2025-11-11",
            "employmentType": "FULL_TIME",
            "hiringOrganization": { "@type": "Organization", "name": "Dashedo GmbH" },
            "industry": "Software",
            "jobLocation": {
                "@type": "Place",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Berlin",
                    "addressCountry": "DE"
                }
            },
            "description": "Масштабируй наш рост на рынке DACH. Фокус: Mid-Market/Enterprise.",
            "qualifications": "2–4 года опыта в SaaS-продажах, свободный немецкий и английский.",
            "baseSalary": {
                "@type": "MonetaryAmount",
                "currency": "EUR",
                "value": {
                    "@type": "QuantitativeValue",
                    "value": "⟨xx⟩",
                    "unitText": "YEAR"
                }
            }
        }
    ];

    return (
        <>
            <Helmet>
                <title>Карьера в Dashedo</title>
                <meta
                    name="description"
                    content="Работа в Dashedo: открытые вакансии, формат работы, процесс отбора и условия для команды."
                />
                <link rel="canonical" href="https://dashedo.com/about/careers" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Карьера в Dashedo" />
                <meta
                    property="og:description"
                    content="Открытые позиции и информация о работе в команде Dashedo."
                />
                <meta property="og:url" content="https://dashedo.com/about/careers" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="Карьера в Dashedo" />
                <meta
                    name="twitter:description"
                    content="Условия работы, вакансии и процесс найма в Dashedo."
                />
            </Helmet>
            <Page>
                <div className={s.content}>
                    <nav aria-label="Хлебные крошки">
                        <a href="/">Главная</a> &nbsp;/&nbsp; <a href="/about">О нас</a> &nbsp;/&nbsp; <span>Карьера</span>
                    </nav>

                    <h1 className={s.content__title}>Карьера в Dashedo</h1>
                    <p><strong>Последнее обновление:</strong> 11.11.2025</p>

                    <h2>Почему Dashedo?</h2>
                    <p>
                        Мы — продуктовая команда и создаём софт, который каждый день решает реальные задачи.
                        У нас ты получаешь ответственность, понятные цели и среду, в которой важен реальный <em>impact</em>.
                    </p>

                    <h2>Что мы предлагаем</h2>
                    <ul>
                        <li>Remote-first (европейские часовые пояса) и гибкий формат работы</li>
                        <li>Современное оборудование и личный бюджет на обучение ⟨x €/год⟩</li>
                        <li>🔒 Фокус на качестве: code review, тесты, CI/CD</li>
                        <li>30 дней отпуска и ⟨бенефиты, напр. проездной, спорт⟩</li>
                        <li>Прозрачные карьерные треки и конкурентная компенсация</li>
                    </ul>

                    <h2>Как мы работаем</h2>
                    <ul>
                        <li>Небольшие автономные команды (squads) с чёткими метриками</li>
                        <li>Асинхронная коммуникация, еженедельные демо, квартальные roadmaps</li>
                        <li>Близость к пользователям: интервью, бета-программы, feature flags</li>
                    </ul>

                    <h2 id="open-roles">Открытые вакансии</h2>
                    <article>
                        <h3>Frontend Engineer (m/f/d) – Берлин / удалённо</h3>
                        <p>Стек: ⟨React, TypeScript, Node, Cloud⟩ · Полная занятость</p>
                        <p><a href="#bewerbung">Откликнуться</a></p>
                    </article>
                    <article>
                        <h3>Account Executive DACH (m/f/d) – Берлин / удалённо</h3>
                        <p>Mid-Market/Enterprise · Полная занятость</p>
                        <p><a href="#bewerbung">Откликнуться</a></p>
                    </article>
                    <p>
                        Не нашли подходящую роль? Отправьте{" "}
                        <strong>инициативное резюме</strong> на{" "}
                        <a href="mailto:jobs@dashedo.com">jobs@dashedo.com</a>.
                    </p>

                    <h2 id="prozess">Процесс найма</h2>
                    <ol>
                        <li><strong>Intro-call</strong> (30 минут) — знакомство друг с другом</li>
                        <li><strong>Профессиональное интервью</strong> — обсуждаем опыт и подход к работе</li>
                        <li><strong>Практическое задание</strong> — приближено к реальности и ограничено по времени</li>
                        <li><strong>Интервью с командой</strong> — культура и взаимодействие</li>
                        <li><strong>Оффер</strong> — прозрачно и быстро</li>
                    </ol>

                    <h2 id="bewerbung">Как подать заявку</h2>
                    <p>
                        Отправьте CV/профиль (LinkedIn/GitHub) на{" "}
                        <a href="mailto:jobs@dashedo.com">jobs@dashedo.com</a> и
                        укажите желаемую роль, дату выхода и зарплатные ожидания.
                    </p>

                    <h2>Разнообразие и инклюзия</h2>
                    <p>
                        Мы приветствуем отклики независимо от происхождения, пола, идентичности, религии,
                        инвалидности или возраста. Для нас важны любознательность, чувство ответственности
                        и умение работать в команде.
                    </p>

                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
                    />
                    {jobsJsonLd.map((j, i) => (
                        <script
                            key={i}
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{ __html: JSON.stringify(j) }}
                        />
                    ))}
                </div>
            </Page>
        </>
    );
}

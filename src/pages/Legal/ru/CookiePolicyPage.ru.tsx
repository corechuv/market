// src/pages/Legal/ru/CookiePolicyPage.ru.tsx
import "react"
import { Helmet } from "react-helmet-async"
import Page from "../../../components/UI/Page/Page"
import s from "../Legal.module.scss"
import Button from "../../../components/UI/Button"

export default function CookiePolicyPageRu() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Политика Cookie",
        "url": "https://dashedo.com/legal/cookies",
        "dateModified": "2025-11-11",
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://dashedo.com/" },
                { "@type": "ListItem", "position": 2, "name": "Правовая информация", "item": "https://dashedo.com/legal" },
                { "@type": "ListItem", "position": 3, "name": "Политика Cookie", "item": "https://dashedo.com/legal/cookies" }
            ]
        }
    };

    const openCookieSettings = () => {
        try {
            window.dispatchEvent(new Event("cookie-consent:open"));
            (window as any)?.Cookiebot?.renew?.();
            (window as any)?.OneTrust?.ToggleInfoDisplay?.();
            (window as any)?.klaro?.show?.();
            (window as any)?.CookieConsent?.showPreferences?.();
        } catch (e) {
            alert("Пожалуйста, используйте баннер cookie внизу страницы, чтобы изменить ваши настройки.");
        }
    };

    const title = "Политика Cookie – Правовая информация | Dashedo";
    const description =
        "Как Dashedo использует файлы cookie и аналогичные технологии, на каком основании и как вы можете управлять согласием или отозвать его.";

    return (
        <>
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
                <link rel="canonical" href="https://dashedo.com/legal/cookies" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content="https://dashedo.com/legal/cookies" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
            </Helmet>
            <Page>
                <div className={s.content}>
                    <nav aria-label="Хлебные крошки">
                        <a href="/">Главная</a> &nbsp;/&nbsp; <a href="/legal">Правовая информация</a> &nbsp;/&nbsp; <span>Политика Cookie</span>
                    </nav>

                    <h1>Политика Cookie</h1>
                    <p><strong>Последнее обновление:</strong> 11.11.2025</p>

                    <p>
                        Настоящая политика Cookie объясняет, как <strong>⟨компания, напр. Dashedo GmbH⟩</strong> («мы»)
                        использует файлы cookie и аналогичные технологии на сайте <strong>dashedo.com</strong>. Мы
                        информируем о видах, целях, сроках хранения и правовых основаниях обработки в соответствии
                        со ст.&nbsp;6 GDPR, а также о ваших правах на возражение и отзыв согласия.
                    </p>

                    <h2>1. Что такое файлы cookie?</h2>
                    <p>
                        Cookie — это небольшие текстовые файлы, которые сохраняются на вашем устройстве через браузер.
                        К аналогичным технологиям относятся, например, Local Storage, Session Storage, пиксели и теги.
                        Некоторые cookie технически необходимы, другие используются для статистики, удобства или маркетинга.
                    </p>

                    <h2>2. Правовые основания</h2>
                    <ul>
                        <li>
                            <strong>Необходимые (ст. 6 (1) (f) GDPR):</strong> требуются для предоставления нашего сайта
                            (например, сессия, безопасность, хранение согласий).
                        </li>
                        <li>
                            <strong>Статистика / маркетинг (ст. 6 (1) (a) GDPR):</strong> используются только при наличии
                            вашего согласия через наш баннер согласия (consent banner).
                        </li>
                    </ul>

                    <h2>3. Категории cookie</h2>
                    <ul>
                        <li><strong>Необходимые:</strong> базовые функции, безопасность, распределение нагрузки, предотвращение мошенничества.</li>
                        <li><strong>Предпочтения:</strong> язык, оформление, пользовательские настройки.</li>
                        <li><strong>Статистика:</strong> анонимное/агрегированное измерение использования (например, просмотры страниц).</li>
                        <li><strong>Маркетинг:</strong> измерение охвата, ретаргетинг, отслеживание конверсий.</li>
                        <li><strong>Внешние медиа:</strong> встроенный контент (например, карты, видео).</li>
                    </ul>

                    <h2>4. Управление вашим согласием</h2>
                    <p>Вы можете в любой момент изменить или отозвать своё согласие с действием на будущее:</p>
                    <p>
                        <Button onClick={openCookieSettings}>Открыть настройки Cookie</Button>
                    </p>
                    <p>Кроме того, вы можете изменить настройки cookie в браузере или удалить cookie вручную.</p>

                    <h2>5. Сроки хранения</h2>
                    <p>
                        Сессионные cookie удаляются после окончания сессии. Постоянные cookie хранятся до окончания срока,
                        указанного в нашем инструменте согласия (consent tool), или до тех пор, пока вы не удалите их вручную.
                        Конкретный срок жизни каждого cookie указан в списке cookie в баннере согласия.
                    </p>

                    <h2>6. Используемые сервисы (примеры)</h2>
                    <ul>
                        <li>
                            <strong>Веб-аналитика:</strong> ⟨например, Google Analytics / Matomo⟩ — статистика, производительность.
                            Провайдер: ⟨название, местонахождение⟩.
                        </li>
                        <li>
                            <strong>Маркетинг:</strong> ⟨например, Meta Pixel, LinkedIn Insight Tag⟩ — отслеживание конверсий.
                        </li>
                        <li>
                            <strong>CDN / производительность:</strong> ⟨например, Cloudflare⟩ — безопасность и доставка контента.
                        </li>
                        <li>
                            <strong>Видео / карты:</strong> ⟨например, YouTube, Vimeo, Google Maps⟩ — встроенный контент.
                        </li>
                    </ul>
                    <p>
                        <em>Примечание:</em> актуальный и юридически значимый список провайдеров, включая трансграничную
                        передачу данных, гарантии и сроки хранения, всегда доступен в баннере согласия.
                    </p>

                    <h2>7. Передача данных в третьи страны</h2>
                    <p>
                        Если используются провайдеры за пределами ЕС/ЕЭЗ, передача данных осуществляется на основании
                        соответствующих гарантий (ст.&nbsp;46 GDPR), например стандартных договорных условий ЕС.
                        Подробности см. в списке провайдеров в инструменте согласия.
                    </p>

                    <h2>8. Ваши права</h2>
                    <p>
                        Вы имеете, в частности, право на доступ к данным, их исправление, удаление, ограничение обработки,
                        переносимость данных, а также право возражать против обработки (ст.&nbsp;15–21 GDPR). Вы также
                        можете подать жалобу в надзорный орган по защите данных.
                    </p>

                    <p>
                        Дополнительная информация: <a href="/legal/privacy">Политика конфиденциальности</a>,{" "}
                        <a href="/legal/imprint">Выходные данные (Impressum)</a>.
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

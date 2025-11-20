// src/pages/Legal/ru/ImprintPage.ru.tsx
import "react";
import Page from "../../../components/UI/Page/Page";
import s from "../Legal.module.scss";
import Logo from "../../../components/Footer/Logo";

export default function ImprintPageRu() {
    const orgJsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "⟨Dashedo GmbH⟩",
        "url": "https://dashedo.com/",
        "logo": "https://dashedo.com/⟨pfad-zum-logo⟩.png",
        "email": "mailto:⟨hello@dashedo.com⟩",
        "telephone": "+49 ⟨30⟩ ⟨1234567⟩",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "⟨Musterstraße 1⟩",
            "postalCode": "⟨10115⟩",
            "addressLocality": "Berlin",
            "addressCountry": "DE"
        },
        "sameAs": ["https://www.linkedin.com/company/⟨…⟩", "https://x.com/⟨…⟩"]
    };

    const pageJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Выходные данные (Impressum)",
        "url": "https://dashedo.com/legal/imprint",
        "dateModified": "2025-11-11"
    };

    return (
        <Page>
            <div className={s.content}>

                <Logo />

                <nav aria-label="Хлебные крошки">
                    <a href="/">Главная</a> &nbsp;/&nbsp; <a href="/legal">Правовая информация</a> &nbsp;/&nbsp; <span>Выходные данные (Impressum)</span>
                </nav>

                <h1 className={s.content__title}>Выходные данные (Impressum)</h1>
                <p><strong>Последнее обновление:</strong> 11.11.2025</p>

                <h2>Сведения об операторе в соответствии с § 5 TMG</h2>
                <p>
                    <strong>⟨Dashedo GmbH⟩</strong><br />
                    ⟨Musterstraße 1⟩<br />
                    10115 Берлин, Германия
                </p>
                <p>
                    Телефон: +49 ⟨30⟩ ⟨1234567⟩<br />
                    E-mail: <a href="mailto:⟨hello@dashedo.com⟩">⟨hello@dashedo.com⟩</a><br />
                    Веб-сайт: <a href="https://dashedo.com/">dashedo.com</a>
                </p>

                <h3>Уполномоченные представители</h3>
                <p>Управляющий директор: ⟨Имя Фамилия⟩</p>

                <h3>Регистрационные данные и НДС</h3>
                <p>
                    Регистрационный суд: Amtsgericht Berlin-Charlottenburg<br />
                    Номер в торговом реестре (HRB): ⟨HRB-Nummer⟩<br />
                    ИНН по НДС (USt-IdNr.): ⟨DE-Nummer⟩
                </p>

                <h3>Ответственное лицо в соответствии с § 18 абз. 2 MStV</h3>
                <p>⟨Имя Фамилия⟩, ⟨адрес как выше⟩</p>

                <h2>Ответственность за содержание</h2>
                <p>
                    Как поставщик услуг, мы несем ответственность за собственный контент на этих страницах в
                    соответствии с § 7 абз. 1 TMG. Однако в соответствии с §§ 8–10 TMG мы не обязаны
                    контролировать переданную или сохранённую чужую информацию или расследовать обстоятельства,
                    указывающие на противоправную деятельность. Обязательства по удалению или блокированию
                    использования информации в соответствии с общими законами остаются в силе.
                </p>

                <h2>Ответственность за ссылки</h2>
                <p>
                    Наш веб-сайт содержит ссылки на внешние сайты третьих лиц, содержание которых мы не контролируем.
                    Поэтому мы не несем ответственности за такой внешний контент. За содержание страниц,
                    на которые даются ссылки, всегда отвечает соответствующий провайдер или оператор этих страниц.
                </p>

                <h2>Авторское право</h2>
                <p>
                    Контент и произведения, созданные нами на этих страницах, защищены немецким авторским правом.
                    Воспроизведение, обработка, распространение и любое иное использование за пределами,
                    допускаемыми авторским правом, требуют нашего предварительного письменного согласия.
                </p>

                <h2>Внесудебное урегулирование споров</h2>
                <p>
                    Европейская комиссия предоставляет платформу для онлайн-урегулирования споров (ODR):{" "}
                    <a href="https://ec.europa.eu/odr" rel="noopener noreferrer">ec.europa.eu/odr</a>.
                    Мы не обязаны и, как правило, не готовы участвовать в процедурах урегулирования споров
                    в органах по разрешению потребительских споров, если только это не является прямо
                    предусмотренным законом.
                </p>

                <p>
                    Дополнительная информация: <a href="/legal/privacy">Политика конфиденциальности</a>,{" "}
                    <a href="/legal/cookies">Политика Cookie</a>.
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

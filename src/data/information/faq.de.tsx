// src/data/information/faq.de.tsx
import type { FaqItem } from "./helper";

export const faqItemsDe: FaqItem[] = [
    {
        id: "what-is-dashedo",
        question: "Was ist Dashedo und für wen ist es geeignet?",
        answerText:
            "Dashedo ist ein cloudbasierter Software-Dienst (SaaS) für ⟨kurze Beschreibung eures Produkts⟩. Geeignet für ⟨Zielgruppen⟩.",
        answerContent: (
            <p>
                Dashedo ist ein cloudbasierter Software-Dienst (SaaS) für ⟨kurze Produktbeschreibung⟩.
                Ideal für ⟨Zielgruppen⟩.
            </p>
        ),
    },
    {
        id: "trial",
        question: "Gibt es eine kostenlose Testphase?",
        answerText:
            "Ja, Sie können Dashedo unverbindlich testen. Details zu Dauer und Funktionsumfang finden Sie auf der Seite Preise.",
        answerContent: (
            <p>
                Ja – Umfang und Laufzeit finden Sie unter <a href="/pricing">Preise</a>.
                Eine Kündigung ist jederzeit vor Ende der Testphase möglich.
            </p>
        ),
    },
    {
        id: "change-plan",
        question: "Wie ändere oder kündige ich meinen Plan?",
        answerText:
            "Sie können Ihren Plan jederzeit im Account-Bereich ändern oder kündigen. Die Änderungen gelten zum nächsten Abrechnungszeitraum gemäß unseren AGB.",
        answerContent: (
            <p>
                Im Account-Bereich können Sie Ihren Tarif flexibel anpassen.
                Es gelten die Hinweise in unseren <a href="/legal/terms">AGB</a>.
            </p>
        ),
    },
    {
        id: "payment-methods",
        question: "Welche Zahlungsmethoden werden unterstützt?",
        answerText:
            "Wir unterstützen gängige Zahlungsmethoden über ⟨Stripe/Adyen⟩. Rechnungen stehen im Account zum Download bereit.",
        answerContent: (
            <p>
                Wir akzeptieren Zahlungen über ⟨Stripe/Adyen⟩ (z.&nbsp;B. Kreditkarte, SEPA).
                Rechnungen finden Sie in Ihrem Konto.
            </p>
        ),
    },
    {
        id: "security",
        question: "Wie wird meine Datensicherheit gewährleistet?",
        answerText:
            "Wir setzen TLS-Verschlüsselung, rollenbasierte Zugriffe und regelmäßige Backups ein. Details finden Sie in der Datenschutzerklärung.",
        answerContent: (
            <p>
                Verschlüsselung, Zugriffskontrollen, Backups und Monitoring sind Standard.
                Details: <a href="/legal/privacy">Datenschutzerklärung</a>.
            </p>
        ),
    },
    {
        id: "integrations",
        question: "Bietet ihr Integrationen mit anderen Tools an?",
        answerText:
            "Ja, es gibt Integrationen mit ⟨Beispiel-Tools⟩. Eine aktuelle Liste finden Sie auf der Features-Seite.",
        answerContent: (
            <p>
                Ja, u.&nbsp;a. mit ⟨Beispiel-Tools⟩. Mehr unter <a href="/features">Funktionen</a>.
            </p>
        ),
    },
    {
        id: "access-after-order",
        question: "Wie schnell erhalte ich Zugang nach der Bestellung?",
        answerText:
            "In der Regel sofort. Sollten Sie keine Aktivierungs-E-Mail erhalten, prüfen Sie bitte den Spam-Ordner oder kontaktieren Sie den Support.",
        answerContent: (
            <p>
                In der Regel sofort via Aktivierungs-E-Mail. Prüfen Sie ggf. den Spam-Ordner.
                Hilfe: <a href="/help/shipping">Bereitstellung &amp; Lieferung</a>.
            </p>
        ),
    },
    {
        id: "refunds",
        question: "Wie kann ich eine Rückerstattung beantragen?",
        answerText:
            "Informationen zum Widerruf und zu Erstattungen finden Sie unter Rückgaben & Erstattungen. Wenden Sie sich bei Fragen an den Support.",
        answerContent: (
            <p>
                Hinweise und Voraussetzungen finden Sie unter{" "}
                <a href="/help/returns-refunds">Rückgaben &amp; Erstattungen</a>.
            </p>
        ),
    },
];
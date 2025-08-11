import "react";

type Props = {
    title?: string;
    message?: string;
    backHref?: string;
    backLabel?: string;
};
export default function NotFound({
    title = "Ничего не найдено",
    message = "Попробуйте изменить запрос или вернуться назад.",
    backHref = "/",
    backLabel = "Вернуться",
}: Props) {
    return (
        <div style={{ padding: "48px 16px", textAlign: "center" }}>
            <h2 style={{ marginBottom: 8 }}>{title}</h2>
            <p style={{ marginBottom: 24, opacity: 0.8 }}>{message}</p>
            <a href={backHref} style={{ textDecoration: "none" }}>
                <button style={{ padding: "10px 16px", borderRadius: 8 }}> {backLabel} </button>
            </a>
        </div>
    );
}

import React from "react";
import styles from "./ProductDatasheet.module.scss";

export type ProductDatasheetProps = {
    pdfUrl: string;                 // абсолютный или относительный путь к PDF
    label?: string;                 // подпись кнопки
    fileName?: string;              // имя файла для загрузки
    className?: string;
};

const ProductDatasheet: React.FC<ProductDatasheetProps> = ({
    pdfUrl,
    label = "Download",
    fileName,
    className,
}) => {

    return (
        <a
            href={pdfUrl}
            className={`${styles.btn} ${className ?? ""}`}
            target="_blank"
            download={fileName}
            title="Download PDF"
        >
            {label}
        </a>
    );
};

export default ProductDatasheet;

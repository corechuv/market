// src/components/Product/Details/EnergyLabel.tsx
import React from "react";
import styles from "./EnergyLabel.module.scss";
import Modal from "../../Modal/Modal";

export type EnergyLabelProps = {
    energyClassArrowUrl?: string;  // стало опциональным
    energyClassUrl?: string;       // стало опциональным
    className?: string;
    label?: string;
    size?: "small" | "large"; // default: large
};

const EnergyLabel: React.FC<EnergyLabelProps> = ({
    energyClassUrl,
    energyClassArrowUrl,
    className,
    label = "Energy",
    size = "large",
}) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const badgeSrc = energyClassArrowUrl ?? energyClassUrl; // фолбэк
    if (!badgeSrc) return null; // вообще ничего не рисуем, если нет ни стрелки, ни лейбла

    const open: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        e.stopPropagation();
        if (energyClassUrl) setIsOpen(true); // модалка только если есть full-label
    };

    const stop = (e: React.SyntheticEvent) => e.stopPropagation();

    return (
        <>
            <button
                type="button"
                className={`${styles.badge} ${className ?? ""}`}
                title={label}
                aria-haspopup={energyClassUrl ? "dialog" : undefined}
                aria-expanded={isOpen}
                onClick={open}
                onMouseDown={stop}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") open(e as any);
                }}
            >
                <img
                    src={badgeSrc}
                    className={`${styles.badge__arrow} ${styles[`badge__arrow--${size}`]}`}
                    alt={label}
                />
            </button>

            {energyClassUrl && (
                <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} header={label}>
                    <div className={styles.imgContainer}>
                        <img src={energyClassUrl} alt={label} />
                    </div>
                </Modal>
            )}
        </>
    );
};

export default EnergyLabel;

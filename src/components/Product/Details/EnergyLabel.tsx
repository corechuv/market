import React from "react";
import styles from "./EnergyLabel.module.scss";
import Modal from "../../Modal/Modal";

export type EnergyLabelProps = {
    energyClassArrowUrl: string;
    energyClassUrl: string;
    className?: string;
    label?: string;
    size?: "small" | "large"; // default: large
};

// EnergyLabel.tsx
const EnergyLabel: React.FC<EnergyLabelProps> = ({
    energyClassUrl,
    energyClassArrowUrl,
    className,
    label = "Energy",
    size = "large",
}) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const open = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.stopPropagation();            // главное!
        setIsOpen(true);
    };

    const stop = (e: React.SyntheticEvent) => e.stopPropagation();

    return (
        <>
            {/* семантически корректнее — button */}
            <button
                type="button"
                className={`${styles.badge} ${className ?? ""}`}
                title={label}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                onClick={open}
                onMouseDown={stop}                       // на всякий случай
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") open(e);
                }}
            >
                <img
                    src={energyClassArrowUrl}
                    className={`${styles.badge__arrow} ${styles[`badge__arrow--${size}`]}`}
                    alt={label}
                />
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} header={label}>
                <div className={styles.imgContainer}>
                    <img src={energyClassUrl} alt={label} />
                </div>
            </Modal>
        </>
    );
};

export default EnergyLabel;

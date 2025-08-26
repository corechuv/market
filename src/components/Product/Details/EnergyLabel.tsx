import React from "react";
import styles from "./EnergyLabel.module.scss";
import Modal from "../../Modal/Modal";

export type EnergyLabelProps = {
    energyClassArrowUrl: string;
    energyClassUrl: string;
    className?: string;
    label?: string;
};

const EnergyLabel: React.FC<EnergyLabelProps> = ({ energyClassUrl, energyClassArrowUrl, className, label = "Energy" }) => {

    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <>
            <a
                className={`${styles.badge} ${className ?? ""}`}
                onClick={() => setIsOpen(true)}
                aria-haspopup="dialog"
                title={`${label}`}
            >
                <img src={energyClassArrowUrl} className={styles.badge__arrow} alt={`${label}`} />
            </a>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} header={`${label}`}>
                <div className={styles.imgContainer}>
                    <img src={energyClassUrl} alt={`${label}`} />
                </div>
            </Modal>
        </>
    );
};

export default EnergyLabel;

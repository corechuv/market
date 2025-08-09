import "react"
import { useNavigate } from "react-router-dom";

import cls from "./Logo.module.scss"

interface LogoProps {
    size?: string | number; // optional size prop
}

const Logo: React.FC<LogoProps> = ({ size }) => {
    const nav = useNavigate();

    return (
        <div className={cls.logo}>
            <span className={cls.logo__text} style={{ fontSize: size }} onClick={() => nav("/")}>
                <span className={cls.logo__firstLetter}>d</span>ashedo
            </span>
        </div>
    );
};

export default Logo;

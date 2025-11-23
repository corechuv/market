// src/components/User/Wrapper.Skeleton.tsx
import React from "react";
import s from "./Wrapper.module.scss";

const WrapperSkeleton: React.FC = () => {
    return (
        <section
            className={`${s.profile} ${s["profile--skeleton"]}`}
            aria-busy="true"
            aria-label="Loading profile"
        >
            <div className={s.profile__photo}>
                <div className={s["profile__photo--skeleton"]} />
            </div>

            <div className={s.profile__row}>
                <div className={s.profile__identity}>
                    <div className={s["profile__identity--usernameSkeleton"]} />
                    <div className={s["profile__identity--fullnameSkeleton"]} />
                </div>

                {/* если хочешь – можно и кнопку-заглушку показать */}
                {/* <div className={s.profile__actions}>
                    <div className={s["profile__actions--skeleton"]} />
                </div> */}
            </div>
        </section>
    );
};

export default WrapperSkeleton;

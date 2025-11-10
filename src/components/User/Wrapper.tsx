// src/components/User/Wrapper.tsx
import "react";
import s from "./Wrapper.module.scss";

interface UserProps {
    photoUrl?: string;
    fullname?: string;
    username?: string | null | undefined;
}

const Wrapper: React.FC<UserProps> = ({ photoUrl, fullname, username }) => {

    return (
        <section className={s.profile}>
            <div className={s.profile__photo}>
                {photoUrl ?
                    <img
                        className={s["profile__photo--img"]}
                        src={photoUrl}
                        alt=""
                        loading="lazy"
                    />
                    :
                    <div className={s["profile__photo--no"]}></div>
                }

            </div>
            <div className={s.profile__identity}>
                {fullname &&
                    <h1 className={s["profile__identity--fullname"]}>
                        {fullname}
                    </h1>
                }
                {username &&
                    <div className={s["profile__identity--username"]}>
                        {username}
                    </div>
                }
            </div>
        </section>
    );
};

export default Wrapper;

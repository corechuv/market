import React, { useState } from 'react';
import cls from './ReviewForm.module.scss';
import Button from '../Buttons/Button';

const ReviewForm: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [rating, setRating] = useState<number | null>(null);
    const [hover, setHover] = useState<number | null>(null);
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rating || !text.trim()) return;

        // TODO: заменить на реальную отправку
        console.log({ rating, text });

        // Сброс и возврат к кнопке
        setIsOpen(false);
        setRating(null);
        setText('');
    };

    if (!isOpen) {
        return (
            <Button className={cls.writeButton} onClick={() => setIsOpen(true)} size="small">Write a Review</Button>
        );
    }

    return (
        <form className={cls.form} onSubmit={handleSubmit}>
            <div className={cls.stars}>
                {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (hover ?? rating ?? 0);
                    return (
                        <span
                            key={star}
                            className={`${cls.star} ${active ? cls.active : ''}`}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(null)}
                            onClick={() => setRating(star)}
                        >
                            ★
                        </span>
                    );
                })}
            </div>

            <div className={cls.textareaContainer}>
                <textarea
                    className={cls.textarea}
                    placeholder="Ваш отзыв…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                />
            </div>

            <div className={cls.actions}>
                <Button className={cls.submit} disabled={!rating || !text.trim()} size='small'>Send</Button>
                <Button className={cls.cancel} onClick={() => setIsOpen(false)} size='small'>Cancel</Button>
            </div>
        </form>
    );
};

export default ReviewForm;

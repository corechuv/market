// ProductImageActions.tsx
import React from 'react';
import styles from './ProductImageActions.module.scss';
import HeartIcon from '../Icons/HeartIcon';
import LinkIcon from '../Icons/LinkIcon';

export interface ProductImageActionsProps {
    onCopyLink?: () => void;
    onToggleFavorite?: () => void;
    isFavorite?: boolean;
}

export const ProductImageActions: React.FC<ProductImageActionsProps> = ({
    onCopyLink,
    onToggleFavorite,
    isFavorite = false,
}) => {
    const handleCopyLink = () => {
        if (onCopyLink) {
            onCopyLink();
        } else {
            alert('Ссылка на изображение отправлена!');
        }
    };

    const handleToggleFavorite = () => {
        if (onToggleFavorite) {
            onToggleFavorite();
        } else {
            alert(isFavorite ? 'Удалено из избранного!' : 'Добавлено в избранное!');
        }
    };

    const favoriteButtonClass = isFavorite
        ? `${styles.button} ${styles.active}`
        : styles.button;

    return (
        <div
            className={styles.actions}
            role="group"
            aria-label="Действия с изображением"
        >
            <button
                type="button"
                className={styles.button}
                onClick={handleCopyLink}
                aria-label="Копировать ссылку"
            >
                <LinkIcon />
            </button>
            <button
                type="button"
                className={favoriteButtonClass}
                onClick={handleToggleFavorite}
                aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
            >
                <HeartIcon fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
        </div>
    );
};

export default ProductImageActions;

// ============================
// Modal.tsx
// ============================
import React, { useEffect, useRef } from 'react';
import cls from './Modal.module.scss';
import CloseIcon from '../Icons/CloseIcon';
import { createPortal } from 'react-dom';

export interface ModalProps {
  /** Контент модального окна */
  children: React.ReactNode;
  /** Открыта ли модаль */
  isOpen: boolean;
  /** Обработчик закрытия */
  onClose: () => void;
  /** Вариант расположения */
  variant?: 'center' | 'left' | 'right';
  /** Шапка модали: строка или React‑узел */
  header?: React.ReactNode;
  /** Классы для .modalBody */
  bodyClassName?: string;
  /** Классы для .modalHeader */
  headerClassName?: string;
  /** Доп. классы для корневого .modalContent */
  className?: string;
  headerBorder?: boolean; // optional, if true adds border to header
  sideWidth?: string | number;
}

export default function Modal({
  children,
  isOpen,
  onClose,
  variant = 'center',
  header,
  bodyClassName = '',
  headerClassName = '',
  className = '',
  headerBorder = true,
  sideWidth = '360px',
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Side-effects: scroll‑lock + focus‑trap
  useEffect(() => {
    if (!isOpen) return;
    const prevActive = document.activeElement as HTMLElement | null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    contentRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();

      // focus trap
      if (e.key === 'Tab' && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
      prevActive?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Compute style object for modalContent
  let modalContentStyle: React.CSSProperties = {};
  if (variant === 'left') {
    modalContentStyle.borderRight = '1px dashed var(--border)';
  } else if (variant === 'right') {
    modalContentStyle.borderLeft = '1px dashed var(--border)';
  } else {
    modalContentStyle.border = '1px dashed var(--border)';
  }

  if (variant === 'left' || variant === 'right') {
    modalContentStyle.width =
      typeof sideWidth === 'number' ? `${sideWidth}px` : sideWidth || '360px';
  }

  let modalHeaderStyle: React.CSSProperties = {};
  // Optionally add header border
  modalHeaderStyle.borderBottom = headerBorder
    ? '1px dashed var(--border)'
    : '1px dashed transparent';

  if (!isOpen) return null;


  return createPortal(
    (
      <div
        className={`${cls.modalOverlay} ${cls[variant]}`}
        onClick={onClose}
        role="presentation"
      >
        <div
          className={`${cls.modalContent} ${cls[variant]} ${className}`}
          style={modalContentStyle}
          role="dialog"
          aria-modal="true"
          ref={contentRef}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          {header && (
            <div className={`${cls.modalHeader} ${headerClassName}`} style={modalHeaderStyle}>
              {header}
            </div>
          )}
          <button className={cls.closeButton} onClick={onClose} aria-label="Close modal" type="button">
            <CloseIcon />
          </button>
          <div className={`${cls.modalBody} ${bodyClassName}`}>{children}</div>
        </div>
      </div>
    ),
    document.body
  );
}
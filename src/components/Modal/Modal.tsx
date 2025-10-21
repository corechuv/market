// ============================
// Modal.tsx
// ============================
import React, { useRef, useLayoutEffect } from 'react'; // ← useLayoutEffect
import cls from './Modal.module.scss';
import CloseIcon from '../Icons/CloseIcon';
import { createPortal } from 'react-dom';

// --- Глобальный, безопасный для нескольких модалок скролл-лок ---
let __lockCount = 0;
let __restore: null | (() => void) = null;

function lockBodyScroll() {
  if (typeof window === 'undefined') return () => {};
  const html = document.documentElement;
  const body = document.body;

  if (__lockCount === 0) {
    const scrollY =
      window.scrollY || document.documentElement.scrollTop || 0;
    const scrollbarW = window.innerWidth - html.clientWidth;

    const prev = {
      htmlOverflow: html.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      bodyPaddingRight: body.style.paddingRight,
      scrollY,
    };

    // Блокируем фон без «просачиваний» на iOS
    html.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';

    // Компенсация исчезнувшего скроллбара
    if (scrollbarW > 0) {
      const currentPadding =
        parseFloat(getComputedStyle(body).paddingRight || '0') || 0;
      body.style.paddingRight = `${currentPadding + scrollbarW}px`;
    }

    __restore = () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.width = prev.bodyWidth;
      body.style.paddingRight = prev.bodyPaddingRight;
      window.scrollTo(0, prev.scrollY);
      __restore = null;
    };
  }

  __lockCount++;
  return () => {
    __lockCount--;
    if (__lockCount <= 0 && __restore) {
      __restore();
    }
  };
}

export interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  variant?: 'center' | 'left' | 'right';
  header?: React.ReactNode;
  bodyClassName?: string;
  bodyStyles?: boolean;
  headerClassName?: string;
  className?: string;
  headerBorder?: boolean;
  sideWidth?: string | number;
  tab?: boolean;
  tabContent?: React.ReactNode;
}

export default function Modal({
  children,
  isOpen,
  onClose,
  variant = 'center',
  header,
  bodyStyles = false,
  bodyClassName = '',
  headerClassName = '',
  className = '',
  headerBorder = true,
  sideWidth = '360px',
  tab = false,
  tabContent
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Скролл-лок + фокус-трап
  useLayoutEffect(() => {
    if (!isOpen) return;

    const prevActive = document.activeElement as HTMLElement | null;
    const unlock = lockBodyScroll();

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
      unlock();              // ← корректно возвращаем скролл
      prevActive?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContentStyle: React.CSSProperties = {
    ...(variant === 'left' ? { borderRight: '1px dashed transparent' } :
      variant === 'right' ? { borderLeft: '1px dashed transparent' } :
        { border: '1px dashed transparent' }),
    ...(variant === 'left' || variant === 'right'
      ? { width: typeof sideWidth === 'number' ? `${sideWidth}px` : sideWidth || '360px' }
      : null),
  };

  const modalHeaderStyle: React.CSSProperties = {
    borderBottom: headerBorder ? '1px dashed transparent' : '1px dashed transparent',
  };

  const modalBodyStyle: React.CSSProperties = {
    padding: bodyStyles ? "0" : "20px",
  };

  return createPortal(
    <div
      className={`${cls.modalOverlay} ${cls[variant]}`}
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      onMouseDownCapture={(e) => e.stopPropagation()}
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
        onMouseDownCapture={(e) => e.stopPropagation()}
      >
        {header && (
          <div className={`${cls.modalHeader} ${headerClassName}`} style={modalHeaderStyle}>
            <h3 className={cls.modalHeader__title}>{header}</h3>
            <button
              className={cls.modalHeader__closeButton}
              aria-label="Close modal"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <CloseIcon />
            </button>
          </div>
        )}
        {tab && <>{tabContent}</>}
        <div className={`${cls.modalBody} ${bodyClassName}`} style={modalBodyStyle}>
          <div className={cls.modalScroll}>{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}

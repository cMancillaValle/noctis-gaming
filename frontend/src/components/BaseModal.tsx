import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { lockBodyScroll, unlockBodyScroll } from '../utils/modalScrollLock';

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  maxHeight?: string;
  zIndexClass?: string;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  ariaLabel?: string;
  className?: string;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-2xl',
  maxHeight = 'max-h-[calc(100dvh-2rem)] sm:max-h-[min(92dvh,700px)]',
  zIndexClass = 'z-50',
  closeOnEscape = true,
  closeOnOverlayClick = true,
  ariaLabel = 'Ventana modal',
  className = '',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    lockBodyScroll();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      unlockBodyScroll();
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!mounted || !isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className={`fixed inset-0 ${zIndexClass} flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none font-inter animate-in fade-in duration-150`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      data-modal-overlay
    >
      <div
        className={`bg-[#0f172a] border border-[#334155] rounded-3xl w-full ${maxWidth} ${maxHeight} flex flex-col shadow-2xl overflow-hidden select-text text-white relative animate-in zoom-in-95 duration-150 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default BaseModal;

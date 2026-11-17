// Gestión centralizada del bloqueo de scroll para document.body con soporte para modales anidados
let openModalsCount = 0;
let previousOverflow = '';
let previousPaddingRight = '';

export const lockBodyScroll = (): void => {
  if (typeof document === 'undefined') return;

  if (openModalsCount === 0) {
    previousOverflow = document.body.style.overflow;
    previousPaddingRight = document.body.style.paddingRight;

    // Calcular ancho de barra de scroll para evitar salto visual (layout shift)
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
  }
  openModalsCount++;
};

export const unlockBodyScroll = (): void => {
  if (typeof document === 'undefined') return;

  openModalsCount = Math.max(0, openModalsCount - 1);
  if (openModalsCount === 0) {
    document.body.style.overflow = previousOverflow;
    document.body.style.paddingRight = previousPaddingRight;
  }
};

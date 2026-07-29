/**
 * En pantallas táctiles (iOS sobre todo) el navegador sintetiza eventos de
 * ratón al tocar: se dispara `mouseenter`, se aplica el estilo de hover, y
 * `mouseleave` no llega hasta que se toca en otro lugar. El resultado es que
 * el botón se queda "pegado" con el estilo de hover después de pulsarlo.
 *
 * Este helper devuelve los manejadores únicamente cuando el dispositivo tiene
 * un puntero real (ratón o trackpad), así que en móvil simplemente no se
 * registran y el problema desaparece.
 */
export const canHover = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches

export const hoverProps = (onEnter, onLeave) =>
  canHover() ? { onMouseEnter: onEnter, onMouseLeave: onLeave } : {}

// Registro central de funciones de limpieza de caché.
// Cada módulo con caché en memoria registra aquí su limpiador.
// Al cerrar sesión, se ejecutan todos → ningún dato de un usuario
// queda visible para el siguiente que use el mismo navegador.

const cleaners = new Set()

export function registerCacheCleaner(fn) {
  cleaners.add(fn)
  return () => cleaners.delete(fn)
}

export function clearAllCaches() {
  for (const fn of cleaners) {
    try { fn() } catch {}
  }
  // Limpiar también claves conocidas de localStorage
  try {
    localStorage.removeItem('cobalto-profile')
  } catch {}
}

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.redcobalto.app',
  appName: 'RedCobalto',
  webDir: 'dist',
  // MODO REMOTO: la app nativa carga el sitio en vivo, no una copia
  // empaquetada. Cuando se modifica y despliega la web (git push -> Vercel),
  // la app ya muestra el cambio la próxima vez que se abre — igual que un
  // navegador. No hace falta recompilar ni volver a subir nada a las tiendas
  // salvo que cambie algo nativo (ícono, splash, permisos).
  server: {
    url: 'https://www.redcobalto.com',
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: false,
  },
};

export default config;

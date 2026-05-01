import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.poema.ios',
  appName: 'Poema',
  // webDir is required by Capacitor but ignored when server.url is set
  webDir: 'public',
  server: {
    // Points to the live Vercel deployment — all server features (auth,
    // server actions, Supabase) keep working exactly as on the web.
    url: 'https://poema-official.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'always',  // respects iPhone safe areas natively
    scrollEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: '#FAF6EE',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#FAF6EE',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}

export default config

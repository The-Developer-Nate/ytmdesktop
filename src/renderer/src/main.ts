import './assets/index.css';

import { createApp } from 'vue';
import App from './App.vue';
import * as Sentry from '@sentry/vue';

(async () => {
  const app = createApp(App);

  Sentry.init({
    app,
    dsn: 'https://0c576c7d2dff4d3e00850a0562bcfa0d@o4510644275642368.ingest.us.sentry.io/4510653818994688',
    sendDefaultPii: true,
    integrations: [
      Sentry.browserTracingIntegration(),
      // Sentry's replay integration does not work with webviews, so this is fine.
      Sentry.replayIntegration({ maskAllText: false }),
      Sentry.consoleLoggingIntegration()
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0,
    enableLogs: true,
    environment: (await window.api.app.isDevelopment()) ? 'development' : 'production'
  });

  app.mount('#app');
})();

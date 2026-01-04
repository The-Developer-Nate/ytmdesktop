<script setup lang="ts">
import { ArrowLeftIcon, Bug } from 'lucide-vue-next';
import { ref, onMounted } from 'vue';
import MinIcon from './assets/icons/min-window.svg';
import MaxIcon from './assets/icons/max-window.svg';
import CloseIcon from './assets/icons/close.svg';
import SearchBar from './components/SearchBar.vue';
import ytmStyles from './assets/ytm-styles.css?inline';
import ytmScripts from './assets/ytm-scripts.js?raw';

const api = window.api;

const webview = ref<Electron.WebviewTag | null>(null);
const canGoBack = ref(false);

const handleSearch = (query: string) => {
  if (webview.value && query) {
    webview.value.loadURL(`https://music.youtube.com/search?q=${encodeURIComponent(query)}`);
  }
};

const handleNavigate = (url: string) => {
  if (webview.value && url) {
    webview.value.loadURL(url);
  }
};

const goBack = () => {
  if (webview.value && webview.value.canGoBack()) {
    webview.value.goBack();
  }
};

const toggleDevTools = () => {
  if (webview.value) {
    webview.value.isDevToolsOpened() ? webview.value.closeDevTools() : webview.value.openDevTools();
  }
};

const minimize = () => api.window.minimize();
const maximize = () => api.window.maximize();
const close = () => api.window.close();

onMounted(async () => {
  const cv = webview.value;
  if (!cv) return;

  const updateState = () => {
    canGoBack.value = cv.canGoBack();
  };

  cv.addEventListener('dom-ready', () => {
    updateState();
    cv.insertCSS(ytmStyles);
    cv.executeJavaScript(ytmScripts);
    // Send test message
    setTimeout(() => {
      cv.send('ytm-enhanced-message', 'Hello from Electron!');
    }, 2000);
  });
  cv.addEventListener('did-navigate-in-page', updateState);
  cv.addEventListener('console-message', (e: any) => {
    console.log('[Webview Console]:', e.message);
  });
});
</script>

<template>
  <div id="app-container" class="flex flex-col h-screen w-screen bg-base-300">
    <!-- Top Toolbar -->
    <div id="toolbar" class="flex items-center px-2 h-12 shrink-0 bg-black select-none relative">
      <!-- Back Button -->
      <div
        class="flex items-center gap-1 no-drag transition-all duration-500 ease-in-out overflow-hidden"
        :class="[
          canGoBack
            ? 'max-w-10 opacity-100 mr-2 translate-x-0'
            : 'max-w-0 opacity-0 -translate-x-2.5 mr-0 pointer-events-none'
        ]"
      >
        <button class="btn btn-sm btn-ghost btn-square rounded text-xs" @click="goBack">
          <arrow-left-icon class="w-4 h-4" />
        </button>
      </div>

      <div class="text-sm transition-all duration-500 ease-in-out ml-2">YouTube Music</div>

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Search Bar (Centered Absolute) -->
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
        <div class="pointer-events-auto w-full max-w-md">
          <SearchBar @search="handleSearch" @navigate="handleNavigate" />
        </div>
      </div>

      <!-- Window Controls -->
      <div class="flex items-center no-drag gap-1">
        <button
          class="btn btn-sm btn-ghost btn-square rounded"
          title="Toggle DevTools"
          @click="toggleDevTools"
        >
          <Bug class="w-4 h-4" />
        </button>

        <button class="btn btn-sm btn-ghost btn-square rounded" @click="minimize">
          <MinIcon class="w-4 h-4" />
        </button>
        <button class="btn btn-sm btn-ghost btn-square rounded" @click="maximize">
          <MaxIcon class="w-4 h-4" />
        </button>
        <button
          class="btn btn-sm btn-ghost btn-square hover:bg-red-500 hover:text-white rounded"
          @click="close"
        >
          <CloseIcon class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Webview -->
    <webview
      ref="webview"
      src="https://music.youtube.com"
      class="flex-1 w-full"
      preload="./ytm-preload.js"
    ></webview>
  </div>
</template>

<style>
/* Global styles or specific overrides if needed */
</style>

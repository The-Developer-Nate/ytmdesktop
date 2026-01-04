<script setup lang="ts">
import { ArrowLeftIcon, Bug, MenuIcon } from 'lucide-vue-next';
import { ref, onMounted } from 'vue';
import MinIcon from './assets/icons/min-window.svg';
import MaxIcon from './assets/icons/max-window.svg';
import CloseIcon from './assets/icons/close.svg';
import SearchBar from './components/SearchBar.vue';
import ytmStyles from './assets/ytm-styles.css?inline';

const api = window.api;

const webview = ref<any | null>(null);
const canGoBack = ref(false);
const userLoggedIn = ref(false);
const userIcon = ref('');

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
  });
  cv.addEventListener('did-navigate-in-page', updateState);
  cv.addEventListener('console-message', (e: any) => {
    console.log('[YTM Webview]', e.message);
  });

  // Use shared variables instead of direct IPC
  if (api.shared) {
    api.shared.onUpdate((key, value) => {
      console.log(`[App] Received shared update: ${key} = ${value}`);
      if (key === 'user-logged-in') {
        userLoggedIn.value = value;
      } else if (key === 'user-icon') {
        userIcon.value = value;
      }
    });
  }
});
</script>

<template>
  <div id="app-container" class="flex flex-col h-screen w-screen bg-base-300">
    <!-- Top Toolbar -->
    <div id="toolbar" class="flex items-center px-2 h-12 shrink-0 bg-black select-none relative">
      <!-- Back Button -->
      <div class="flex items-center gap-0.5">
        <div
          class="flex items-center gap-1 no-drag transition-all duration-500 ease-in-out overflow-hidden"
          :class="[
            canGoBack
              ? 'max-w-10 opacity-100 translate-x-0'
              : 'max-w-0 opacity-0 -translate-x-2.5 mr-0 pointer-events-none'
          ]"
        >
          <button class="btn btn-sm btn-square rounded-l-full text-xs" @click="goBack">
            <arrow-left-icon class="w-4 h-4" />
          </button>
        </div>

        <button
          :class="{
            'btn btn-square btn-sm transition-all duration-500 ease-in-out text-left': true,
            'rounded-l-full': !canGoBack
          }"
          @click="api.shared.call('ytm.toggleGuide')"
        >
          <MenuIcon class="w-4 h-4" />
        </button>

        <button class="btn btn-sm rounded-r-full">YouTube Music</button>
      </div>

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
          v-if="!userLoggedIn"
          class="btn btn-sm rounded-full"
          @click="api.shared.call('ytm.signIn')"
        >
          Sign In
        </button>
        <button
          v-else
          class="btn btn-circle btn-sm overflow-clip"
          @click="api.shared.call('ytm.openSettings')"
        >
          <img :src="userIcon" />
        </button>

        <button
          class="btn btn-sm btn-square rounded-full"
          title="Toggle DevTools"
          @click="toggleDevTools"
        >
          <Bug class="w-4 h-4" />
        </button>

        <div class="flex items-center gap-0.5">
          <button class="btn btn-sm btn-square rounded-l-full" @click="minimize">
            <MinIcon class="w-4 h-4" />
          </button>
          <button class="btn btn-sm btn-square" @click="maximize">
            <MaxIcon class="w-4 h-4" />
          </button>
          <button
            class="btn btn-sm btn-square hover:bg-red-500 hover:text-white rounded-full rounded-l-none"
            @click="close"
          >
            <CloseIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Webview -->
    <webview
      ref="webview"
      src="https://music.youtube.com"
      class="flex-1 w-full"
      :preload="api.ytm.preloadPath"
    ></webview>
  </div>
</template>

<style>
/* Global styles or specific overrides if needed */
</style>

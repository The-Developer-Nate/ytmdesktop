<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import { Search, SearchAlert } from 'lucide-vue-next';

const emit = defineEmits(['search', 'navigate']);

const query = ref('');
const results = ref<any[]>([]);
const showResults = ref(false);
const input = useTemplateRef('search-input');
let debounceTimeout: NodeJS.Timeout;

const performSearch = async () => {
  if (!query.value.trim()) {
    results.value = [];
    return;
  }

  try {
    const response = await window.api.ytm.search(query.value);
    results.value = response.results || [];
    showResults.value = true;
  } catch (e) {
    console.error(e);
  }
};

const onInput = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(performSearch, 300);
};

const selectResult = (result: any) => {
  showResults.value = false;

  if (result.type === 'suggestion') {
    query.value = result.text;
    emit('search', result.text);
    return;
  }

  // Handle Rich Results (MusicResponsiveListItem)
  if (['artist', 'album', 'playlist'].includes(result.itemType) && result.browseId) {
    // Direct navigation for these types
    emit('navigate', `https://music.youtube.com/browse/${result.browseId}`);
  } else if (result.itemType === 'song' || result.itemType === 'video') {
    // For songs, search "Artist - Song"
    const searchString = result.artist ? `${result.artist} - ${result.text}` : result.text;
    query.value = searchString;
    emit('search', searchString);
  } else {
    // Fallback
    query.value = result.text;
    emit('search', result.text);
  }
};

const onEnter = () => {
  showResults.value = false;
  emit('search', query.value);
};

const onEsc = () => {
  showResults.value = false;
  input.value?.blur();
};
</script>

<template>
  <div class="relative w-full max-w-md no-drag">
    <div class="relative">
      <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search class="w-4 h-4 text-gray-400" />
      </div>
      <input
        ref="search-input"
        v-model="query"
        type="text"
        :class="[
          'block w-full h-9 px-2 pl-10 text-sm transition-all text-white border-neutral-700 bg-neutral-900 placeholder-gray-400 outline-none',
          showResults ? 'rounded-2xl rounded-b-none border-b-0 border' : 'rounded-3xl border-none'
        ]"
        placeholder="Search..."
        @input="onInput"
        @keydown.enter="onEnter"
        @keydown.esc="onEsc"
        @focus="showResults = true"
        @blur="showResults = false"
      />
    </div>

    <!-- Dropdown -->
    <div
      v-if="results.length > 0"
      :class="{
        'absolute z-10 w-full rounded-t-none transition-all bg-neutral-900/75 backdrop-blur-lg border border-neutral-700 rounded-2xl shadow-lg': true,
        'opacity-0 pointer-events-none rounded-t-lg': !showResults
      }"
    >
      <ul class="py-1 text-sm text-gray-200">
        <li
          v-for="(result, index) in results"
          :key="index"
          class="px-4 py-2 bg-neutral-800/0 hover:bg-neutral-800/50 ease-out transition-colors cursor-pointer flex items-center gap-2"
          @click="selectResult(result)"
        >
          <img
            v-if="result.thumbnail"
            :src="result.thumbnail"
            class="w-8 h-8 rounded object-cover shrink-0"
          />
          <Search v-else class="w-3 h-3 text-gray-500 shrink-0" />
          <div class="flex flex-col overflow-hidden">
            <span class="truncate">{{ result.text }}</span>
            <span v-if="result.subtitle" class="text-xs text-gray-500 truncate">{{
              result.subtitle
            }}</span>
          </div>
        </li>
      </ul>
    </div>
    <div
      v-else
      :class="{
        'absolute z-10 w-full rounded-t-none transition bg-neutral-900/75 backdrop-blur-lg border border-neutral-700 rounded-2xl shadow-lg': true,
        'opacity-0 pointer-events-none rounded-t-lg': !showResults
      }"
    >
      <ul class="py-1 text-sm text-gray-200">
        <li class="px-4 pt-4 pb-2 scale-125 flex justify-center gap-2">
          <SearchAlert class="scale-150" />
        </li>
        <li class="px-4 pb-4 pt-2 flex justify-center gap-2 text-center">
          <div class="flex flex-col overflow-hidden">
            <span class="truncate">Uh oh! No results found.</span>
            <span class="text-xs text-gray-500 truncate">Try a different search term.</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

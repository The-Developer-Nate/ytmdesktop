<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import { Search, SearchAlert } from 'lucide-vue-next';

const emit = defineEmits(['search', 'navigate']);

const query = ref('');
const results = ref<any[]>([]);
const showResults = ref(false);
const navigating = ref(false);
const input = useTemplateRef('search-input');

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

const selectResult = (result: any) => {
  navigating.value = true;
  console.log(result);
  showResults.value = false;

  if (result.type === 'suggestion') {
    console.log(`suggestion: ${result.text}`);
    query.value = result.text;
    emit('search', result.text);
    return;
  }

  // Handle Rich Results (MusicResponsiveListItem)
  if (['artist', 'album', 'playlist'].includes(result.itemType) && result.browseId) {
    console.log(`rich result: ${result.text}`);
    // Direct navigation for these types
    emit('navigate', `https://music.youtube.com/browse/${result.browseId}`);
  } else if (result.itemType === 'song' || result.itemType === 'video') {
    console.log(`rich result: ${result.text}`);
    // For songs, search "Artist - Song"
    const searchString = result.artist ? `${result.artist} - ${result.text}` : result.text;
    query.value = searchString;
    emit('search', searchString);
  } else {
    console.log(`fallback: ${result.text}`);
    // Fallback
    query.value = result.text;
    emit('search', result.text);
  }
  navigating.value = false;
};

const onEnter = () => {
  showResults.value = false;
  emit('search', query.value);
};

const onEsc = () => {
  showResults.value = false;
  input.value?.blur();
};

// Transition Hooks for Smooth Height Animation
// Transition Hooks for Smooth Height Animation
const onTransitionBeforeEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.opacity = '0';
  // If we are already animating height, we might want to capture the current state,
  // but for "out-in" mode, the leaving element should have already handled the container height.
  // Actually, 'mode="out-in"' means the new element enters ONLY after the old one leaves.
  // We need to animate the CONTAINER's height to match the new element.
  // BUT: The container is the parent <div>. The transition handles the <div> or <ul> inside.
};

const onTransitionEnter = (el: Element, done: () => void) => {
  const element = el as HTMLElement;
  const parent = element.parentElement;

  if (parent) {
    // Get the height of the entering element
    const height = element.scrollHeight;

    // Animate parent height
    parent.style.transition = 'height 0.3s ease';
    parent.style.height = `${parent.scrollHeight}px`; // Start from current

    // Force reflow
    // element.offsetHeight;

    requestAnimationFrame(() => {
      parent.style.height = `${height}px`;
      element.style.opacity = '1';
    });
  }

  // Determine when transition ends based on CSS
  element.addEventListener('transitionend', done, { once: true });
};

const onTransitionAfterEnter = (el: Element) => {
  const element = el as HTMLElement;
  const parent = element.parentElement;
  if (parent) {
    parent.style.height = 'auto'; // Reset to auto after animation
    parent.style.transition = '';
  }
};

const onTransitionBeforeLeave = (el: Element) => {
  const element = el as HTMLElement;
  const parent = element.parentElement;
  if (parent) {
    // Lock the current height before leaving so it can animate
    parent.style.height = `${parent.scrollHeight}px`;
    parent.style.transition = 'height 0.3s ease';
  }
  element.style.opacity = '1';
};

const onTransitionLeave = (el: Element, done: () => void) => {
  const element = el as HTMLElement;
  element.style.opacity = '0';
  element.addEventListener('transitionend', done, { once: true });
};

const onBlur = () => {
  setTimeout(() => {
    showResults.value = false;
  }, 150);
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
        @input="performSearch"
        @keydown.enter="onEnter"
        @keydown.esc="onEsc"
        @focus="showResults = true"
        @blur="onBlur"
      />
    </div>

    <!-- Dropdown -->
    <div
      :class="[
        'absolute z-10 w-full rounded-t-none bg-neutral-900/75 backdrop-blur-lg border border-neutral-700 rounded-2xl shadow-lg border-t-0 overflow-hidden transition-all duration-200',
        showResults
          ? 'rounded-t-none opacity-100 translate-y-0'
          : 'rounded-t-lg opacity-0 translate-y-2 pointer-events-none'
      ]"
    >
      <Transition
        mode="out-in"
        @before-enter="onTransitionBeforeEnter"
        @enter="onTransitionEnter"
        @after-enter="onTransitionAfterEnter"
        @before-leave="onTransitionBeforeLeave"
        @leave="onTransitionLeave"
      >
        <div v-if="results.length > 0" key="results" class="w-full">
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
        <div v-else key="no-results" class="w-full">
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
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition:
    opacity 0.2s ease,
    height 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>

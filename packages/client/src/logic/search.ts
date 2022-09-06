import { useStorage } from '@vueuse/core';
import { computed } from 'vue';
import Fuse from 'fuse.js';
import { list } from './state';

export const searchText = ref('');
export const includeNodeModules = useStorage(
  'vite-inspect-include-node-modules',
  false,
);
export const includeVirtual = useStorage('vite-inspect-include-virtual', false);
let isSearching = false;

export const searchResults = computed(() => {
  if (isSearching) {
    return true;
  }
  let data = list.value?.modules || [];

  if (!includeNodeModules.value) {
    data = data.filter(item => !item.id.includes('/node_modules/'));
  }

  if (!includeVirtual.value) {
    data = data.filter(item => !item.virtual);
  }

  if (!searchText.value) {
    return data;
  }

  const result = data.filter(item => item.id.includes(searchText.value));
  isSearching = false;
  return result;
});

import { createEventHook, useStorage } from '@vueuse/core';
import { computed, ref } from 'vue';
import { getModuleList } from './request';

type Mode = 'detailed' | 'graph' | 'config';
export const onRefetch = createEventHook<void>();
export const enableDiff = useStorage('vite-inspect-diff', true);
export const listMode = useStorage<Mode>('vite-inspect-mode', 'config');
export const lineWrapping = useStorage('vite-inspect-line-wrapping', false);
export const MAX_MODULE_COUNT_FOR_GRAPH = 100;
export const list = ref(await getModuleList());
const modes = ['detailed', 'graph', 'config', 'output'];
export function toggleMode() {
  const getMode = () =>
    modes[(modes.indexOf(listMode.value) + 1) % modes.length] as Mode;
  const mode = getMode();
  if (
    list.value.modules.length > MAX_MODULE_COUNT_FOR_GRAPH &&
    mode === 'graph'
  ) {
    // skip graph
    listMode.value = modes[(modes.indexOf('graph') + 1) % modes.length] as Mode;
  } else {
    listMode.value = mode;
  }
}

export const root = computed(() => list.value?.root || '');

export async function refetch() {
  onRefetch.trigger();
  list.value = await getModuleList();
}

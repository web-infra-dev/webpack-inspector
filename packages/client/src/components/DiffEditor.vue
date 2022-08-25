<script setup lang="ts">
import { onMounted, ref, toRefs, watchEffect } from 'vue';
import { guessMode } from '../logic/utils';
import { monaco } from '../logic/customMonaco';
const props = defineProps<{ from: string; to: string }>();
const { from, to } = toRefs(props);

const diffContainerEl = ref<HTMLTextAreaElement>();
let diffEditor: monaco.editor.IStandaloneDiffEditor | null = null;

onMounted(() => {
  if (!diffContainerEl.value) {
    return;
  }
  watchEffect(() => {
    diffEditor?.dispose();
    const originalModel = monaco.editor.createModel(
      from.value,
      guessMode(from.value),
    );
    const modifiedModel = monaco.editor.createModel(
      to.value,
      guessMode(to.value),
    );

    diffEditor = monaco.editor.createDiffEditor(diffContainerEl.value!, {
      fontSize: 15,
      fontFamily: 'Consolas',
    });
    diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel,
    });
  });
});
</script>

<template>
  <div class="w-300 h-300">
    <div ref="diffContainerEl" class="w-300 h-300"></div>
  </div>
</template>

<style lang="postcss">
.diff-added {
  @apply bg-green-400/15;
}

.diff-removed {
  @apply bg-red-400/15;
}

.diff-added-inline {
  @apply bg-green-400/30;
}

.diff-removed-inline {
  @apply bg-red-400/30;
}
</style>

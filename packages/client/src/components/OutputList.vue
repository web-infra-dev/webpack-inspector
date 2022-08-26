<script lang="ts" setup>
import { isDark } from "../logic";
import { getOutputFiles } from "../logic/request";
import type { Directory } from "../types";
const router = useRouter();

const output = ref<Directory>(await getOutputFiles());
const handleFileClick = (data: Directory) => {
  router.push(`/chunk?file=${data.path}`);
};
</script>

<template>
  <div class="m-4">
    <p class="my-2 text-center text-lg font-500">📁 Output Files</p>
    <div class="flex items-center">
      <carbon:circle-filled class="color-green" />
      <span class="m-1 color-green">Async Chunk</span>
      <carbon:circle-filled class="ml-4 color-amber-4" />
      <span class="m-1 color-amber-4">Initial Chunk</span>
    </div>
    <TreeBrowser
      :data="output"
      :expanded="true"
      @itemClick="handleFileClick"
    ></TreeBrowser>
  </div>
</template>

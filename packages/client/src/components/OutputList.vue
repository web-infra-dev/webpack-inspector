<script lang="ts" setup>
import { isDark } from "../logic";
import { getOutputFiles } from "../logic/request";
import type { Directory } from "../types";

const output = ref<Directory>(await getOutputFiles());
const handleFileClick = (data: Directory) => {
  alert(data.path);
};
</script>

<template>
  <div class="m-4">
    <p class="my-2 text-center text-lg font-500">📁 Output Files</p>
    <TreeBrowser
      :data="output"
      :expanded="true"
      @itemClick="handleFileClick"
    ></TreeBrowser>
  </div>
</template>

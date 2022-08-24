<script lang="ts" setup>
import { isDark } from "../logic";
import { getOutputFiles } from "../logic/request";
import { Directory } from "../types";

const output = ref<Directory>(await getOutputFiles());
</script>

<template>
  <div class="m-4">
    <p class="my-2">Webpack Output</p>
    <!-- TODO: 换成 Tree View 组件 -->
    <JsonViewer :value="output" boxed expanded :theme="isDark ? 'dark' : 'light'" />
  </div>
</template>

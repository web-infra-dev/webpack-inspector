<script lang="ts" setup>
import { JsonViewer } from "vue3-json-viewer"
import { isDark } from "../logic";
import { getWebpackConfig } from '../logic/request';
import "vue3-json-viewer/dist/index.css";

const jsonData = ref(await getWebpackConfig());
</script>

<template>
  <div class="m-4">
    <p class="my-2">Webpack Final Config</p> 
    <JsonViewer :value="jsonData" boxed expanded :theme="isDark ? 'dark' : 'light'" />
  </div>
</template>

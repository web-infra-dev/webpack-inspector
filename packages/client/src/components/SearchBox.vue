<script setup lang="ts">
import { includeNodeModules, searchText } from '../logic';
</script>

<template>
  <input
    v-model="searchText"
    type="text"
    class="border border-main px-3 py-1 rounded bg-transparent !outline-none"
    placeholder="Search..."
  >
  <div class="text-xs flex flex-col h-min">
    <label class="flex">
      <input
        v-model="includeNodeModules"
        type="checkbox"
        class="my-auto"
      >
      <div class="ml-1">node_modules</div>
    </label>
  </div>
</template>

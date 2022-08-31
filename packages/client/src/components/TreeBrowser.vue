<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";
import type { Directory, File } from "../types";
const emit = defineEmits(["itemClick"]);
const props = defineProps<{ data: Directory & File; depth: number; expanded: boolean }>();
const currentDepth = props.depth || 0;
let isExpanded = ref<boolean>(props.expanded || true);
const identStyle = `margin-left: ${currentDepth * 2}rem;`;
const isDirectory = computed(() => props.data.children && props.data.children.length > 0);
const handleClick = () => {
  isExpanded.value = !isExpanded.value;
  if (!isDirectory.value) {
    emit("itemClick", props.data);
  }
};
const isMapFile = computed(() => props.data.path.endsWith(".map"));
const tagColor = isDirectory.value
  ? `text-stone`
  : props.data.async
  ? `text-green`
  : `text-amber-4`;
const size = computed(() => {
  if (props.data.size) {
    return props.data.size;
  }
  const computeDirectorySize = (dir) => {
    return dir.children.reduce((acc, child) => {
      // Judge map file
      if (child.name && child.name.endsWith(".map")) {
        return acc;
      }
      if (child.size) {
        return acc + child.size;
      }
      return acc + computeDirectorySize(child);
    }, 0);
  };
  return computeDirectorySize(props.data);
});
</script>

<template>
  <div>
    <div
      v-if="!isMapFile"
      @click="handleClick"
      :style="identStyle"
      class="flex items-center"
    >
      <span v-if="isDirectory">
        <carbon:caret-down v-if="isExpanded" />
        <carbon:caret-right v-else />
      </span>
      <carbon:file-storage v-else />
      <span class="ml-1 cursor-pointer hover:bg-light-blue-400/10" :class="tagColor"
        >{{ isDirectory ? data.path : data.name }} ({{ (size / 1024).toFixed(2) }}
        KB)
      </span>
    </div>
    <div v-if="isExpanded">
      <TreeBrowser
        v-for="child in data.children"
        :key="child.path"
        :data="child"
        :depth="currentDepth + 1"
        :expanded="isExpanded"
        @itemClick="(data) => emit('itemClick', data)"
      />
    </div>
  </div>
</template>

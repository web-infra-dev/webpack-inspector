<script lang="ts" setup>
import { defineProps } from "vue";
import type { Directory } from "../types";
const emit = defineEmits(["itemClick"]);
const props = defineProps<{ data: Directory; depth: number; expanded: boolean }>();
const currentDepth = props.depth || 0;
let isExpanded = ref<boolean>(props.expanded || true);
const identStyle = `margin-left: ${currentDepth * 2}rem;`;
const hasChildren = computed(() => props.data.children && props.data.children.length > 0);
const handleClick = () => {
  isExpanded.value = !isExpanded.value;
  if (!hasChildren.value) {
    emit("itemClick", props.data);
  }
};
</script>

<template>
  <div>
    <div @click="handleClick" :style="identStyle" class="flex items-center">
      <span v-if="hasChildren">
        <carbon:caret-down v-if="isExpanded" />
        <carbon:caret-right v-else />
      </span>
      <carbon:file-storage v-else />
      <span class="ml-1">{{ data.path }}</span>
    </div>
    <div v-if="isExpanded">
      <TreeBrowser
        v-for="child in data.children"
        :key="child.path"
        :data="child"
        :depth="currentDepth + 1"
        :expanded="isExpanded"
        @itemClick="data => emit('itemClick', data)"
      />
    </div>
  </div>
</template>

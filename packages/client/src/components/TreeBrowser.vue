<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";
import type { Directory, File } from "../types";
const emit = defineEmits(["itemClick"]);
const props = defineProps<{ data: Directory & File; depth: number; expanded: boolean }>();
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
const isMapFile = computed(() => props.data.path.endsWith('.map'));
const tagColor = hasChildren.value ?
  `text-black` :
    props.data.async ?
      `text-green` :
      `text-amber-4`;
</script>

<template>
  <div>
    <div
      v-if="!isMapFile"
      @click="handleClick"
      :style="identStyle"
      class="flex items-center"
    >
      <span v-if="hasChildren">
        <carbon:caret-down v-if="isExpanded" />
        <carbon:caret-right v-else />
      </span>
      <carbon:file-storage v-else />
      <span class="ml-1" :class="tagColor">{{ data.path }}</span>
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

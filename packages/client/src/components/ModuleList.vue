<script setup lang="ts">
import { start } from 'repl';
import { listMode, searchText } from '../logic';

const props = defineProps<{
  modules: Array<{
    id: string;
    loaders: any[];
  }>;
}>();
const PAGE_ITEM_LIMIT = 20;
const currentPage = ref(1);
const onClickHandler = (page: number) => {
  currentPage.value = page;
}
const startIndex = computed(() => (currentPage.value - 1) * PAGE_ITEM_LIMIT)
const endIndex = computed(() => Math.min(startIndex.value + PAGE_ITEM_LIMIT, props.modules.length))
watchEffect(() => {
  if (props.modules.length) {
    currentPage.value = 1
  }
})
</script>

<template>
  <div v-if="modules">
    <div v-if="!modules.length" class="px-6 py-4 opacity-50 italic">
      <div v-if="searchText">No search result</div>
      <div v-else>
        No module recorded yet, visit <a href="/" target="_blank">your app</a> first and then refresh this page.
      </div>
    </div>
    <RouterLink
      v-for="m in modules.slice(startIndex,endIndex)"
      :key="m.id"
      class="block border-b border-main px-3 py-2 text-left font-mono text-sm"
      :to="`/module?id=${encodeURIComponent(m.id)}`"
    >
      <ModuleId :id="m.id" />
      <div v-if="listMode === 'detailed'" class="text-xs opacity-50">
        <template v-for="(i, idx) in m.loaders.slice(0)" :key="i">
          <span v-if="idx !== 0" class="opacity-20">|</span>
          <span class="mx-0.5">
            <PluginName :name="i" :hide="true" />
          </span>
        </template>
      </div>
    </RouterLink>
    <div class="mx-2 my-2">   
      <vue-awesome-paginate
      :total-items="modules.length"
      :items-per-page="PAGE_ITEM_LIMIT"
      :max-pages-shown="10"
      :current-page="currentPage"
      :on-click="onClickHandler"
    />
    </div>
  </div>
</template>


<style>
  .pagination-container {
    display: flex;
    justify-content: center;
    column-gap: 10px;
  }
  .paginate-buttons {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    width: 40px;
    border-radius: 20px;
    cursor: pointer;
    background-color: rgb(242, 242, 242);
    border: 1px solid rgb(217, 217, 217);
    color: black;
  }
  .paginate-buttons:hover {
    background-color: #d8d8d8;
  }
  .active-page {
    background-color: #3498db;
    border: 1px solid #3498db;
    color: white;
  }
  .active-page:hover {
    background-color: #2988c8;
  }
</style>

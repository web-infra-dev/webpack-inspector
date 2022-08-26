<script setup lang="ts">
import { msToTime } from '../../logic/utils';
import { enableDiff, lineWrapping, onRefetch } from '../../logic';
import { getChunk } from '../../logic/request';

const route = useRoute();
const id = computed(() => route?.query.file as string);

const data = ref(await getChunk(id.value));
async function refetch() {
  if (id.value) {
    data.value = await getChunk(id.value);
  }
}

onRefetch.on(async () => {
  await refetch();
});

watch(id, () => refetch(), { immediate: true });
</script>

<template>
  <NavBar>
    <router-link class="icon-btn !outline-none my-auto" to="/">
      <carbon-arrow-left />
    </router-link>
    <ModuleId v-if="id" :id="id" />
    <div class="flex-auto" />
    <button
      class="icon-btn text-lg"
      title="Line Wrapping"
      @click="lineWrapping = !lineWrapping"
    >
      <carbon:text-wrap :class="lineWrapping ? 'opacity-100' : 'opacity-25'" />
    </button>
    <button
      class="icon-btn text-lg"
      title="Toggle Diff"
      @click="enableDiff = !enableDiff"
    >
      <carbon:compare :class="enableDiff ? 'opacity-100' : 'opacity-25'" />
    </button>
  </NavBar>
  <Container v-if="data" class="grid overflow-hidden">
    <CodeViewer :code="data" />
  </Container>
</template>

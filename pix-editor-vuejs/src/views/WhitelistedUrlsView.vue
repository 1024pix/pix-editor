<script setup>
import {onMounted} from "vue";
import {api} from "../api";
import { camel } from 'kitsu-core'
import WhitelistedUrl from "../models/WhitelistedUrl.js";
import PixTable from '../components/PixTable.vue';
import PixTableColumn from '../components/PixTableColumn.vue';
import { ref } from "vue";

const whitelistedUrls = ref([]);

onMounted(async () => {
  const { data } = await api.get('whitelisted-urls');

  whitelistedUrls.value = data.map(whitelistedUrl => {
    const object = {};
    Object.keys(whitelistedUrl).forEach(key => {
      const camelisedKey = camel(key);
      object[camelisedKey] = whitelistedUrl[key];
    })
    return new WhitelistedUrl(object);
  });
  console.log(whitelistedUrls.value[0])
});

</script>

<template>
  <div class="about">
    <h1>Whitelisted Urls</h1>
    <PixTable
      :data="whitelistedUrls"
      caption="Liste des URLs à ne pas mettre dans les URLs cassées"
      condensed
      variant="primary"
    >
      <template #columns="{ row, context }" >
        <PixTableColumn :context="context" class="column--wide">
          <template #header>URL</template>
          <template #cell>{{ row.url }}</template>
        </PixTableColumn>
      </template>
    </PixTable>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}

* {
  color: black;
}
</style>

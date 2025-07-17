<script setup>
import {onMounted} from "vue";
import {api} from "../api";
import { camel } from 'kitsu-core'
import WhitelistedUrl from "../models/WhitelistedUrl.js";



onMounted(async () => {
  const {data:whitelistedUrls} = await api.get('whitelisted-urls');
  console.log('LIST', whitelistedUrls);

  const result = whitelistedUrls.map(whitelistedUrl => {
    const object = {};
    Object.keys(whitelistedUrl).forEach(key => {
      const camelisedKey = camel(key);
      object[camelisedKey] = whitelistedUrl[key];
    })
    return new WhitelistedUrl(object);
  })
  console.log(result);

})
</script>

<template>
  <div class="about">
    <h1>Whitelisted Urls</h1>
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
</style>

<script setup>
import {onMounted, ref} from "vue";
import {api} from "../api";
import { camel } from 'kitsu-core'
import Framework from "../models/Framework.js";

const frameworks = ref([]);

async function loadFrameworkAreas(framework) {
  console.log(await framework.areas.load());
}

onMounted(async () => {
  const { data: kebabFrameworks } = await api.get('frameworks');

  console.log(kebabFrameworks)

  frameworks.value = kebabFrameworks.map((framework) => {
    const object = {};
    Object.keys(framework).forEach(key => {
      const camelisedKey = camel(key);
      object[camelisedKey] = framework[key];
    })
    return new Framework(object);
  });
})
</script>

<template>
  <div class="about">
    <h1>Référentiels</h1>
    <ul>
      <li v-for="framework in frameworks" :key="framework.id">
        {{ framework.name }}
        <button @click="loadFrameworkAreas(framework)">CHARGER 🔋</button>
      </li>
    </ul>
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

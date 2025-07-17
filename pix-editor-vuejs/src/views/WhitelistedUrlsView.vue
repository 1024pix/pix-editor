<script setup>
import {onMounted} from "vue";

onMounted(async () => {
  const dataApi = await fetch('http://localhost:3002/api/whitelisted-urls', {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
  }).then(res => res.json())
  console.log('LIST', dataApi)
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

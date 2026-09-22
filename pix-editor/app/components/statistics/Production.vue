<script setup>
import { useAreas } from "../../composables/areas";
import { useCompetencesByAreaIds } from "../../composables/competences";
import { computed, watchEffect } from 'vue';


const productionTubeTotal = 50;
const productionSkillTotal = 28;
const productionChallengeTotal = 4528;

const productionData = [
  {
    name: "1.1",
    tubes: "23",
    skills: "3",
    challenges: "20",
    rate: "70"
  }
]

const { data: areas } = useAreas();
const areaIds = computed(() => areas.value?.map((area) => area.id));
const { data: competences, state } = useCompetencesByAreaIds(areaIds);

watchEffect(() => {
  console.log('areas', areas.value)
  console.log('competences', competences.value)
});
</script>

<template>
  <h2 class="ui header">
    <i class="rocket icon"></i>
    <div class="content">
      En production
    </div>
  </h2>
  <div class="ui three column padded grid">
    <div class="column">
      <div class="ui blue segment center aligned">
        <div class="ui header">
          {{productionTubeTotal}}
          <div class="sub header">
            Tubes
          </div>
        </div>
      </div>
    </div>
    <div class="column">
      <div class="ui blue segment center aligned">
        <div class="ui header">
          {{productionSkillTotal}}
          <div class="sub header">
            Acquis
          </div>
        </div>
      </div>
    </div>
    <div class="column">
      <div class="ui blue segment center aligned">
        <div class="ui header">
          {{productionChallengeTotal}}
          <div class="sub header">
            Épreuves
          </div>
        </div>
      </div>
    </div>
    <div class="three columns">
      <div class="ui blue segment five column grid center aligned statistics-table">
        <div class="column">
          Compétence
        </div>
        <div class="column">
          Tubes
        </div>
        <div class="column">
          Acquis
        </div>
        <div class="column">
          Épreuves
        </div>
        <div class="teal column">
          Part
        </div>
        <template v-for="item of productionData">
          <div class="column">
            {{item.name}}
          </div>
          <div class="column">
            {{item.tubes}}
          </div>
          <div class="column">
            {{item.skills}}
          </div>
          <div class="column">
            {{item.challenges}}
          </div>
          <div class="teal column">
            {{item.rate}}&nbsp;%
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

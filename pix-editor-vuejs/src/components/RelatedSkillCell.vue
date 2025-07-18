<script setup>
import { computed } from 'vue';

const props = defineProps({
  skills: Array,
});

const skillCellContent = computed(() => {
  if (!props.skills) {
    return '';
  }
  const skillsArray = props.skills.split(',');
  const orderedSkillsArray = skillsArray.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'case' }));
  if (orderedSkillsArray.length === 1) {
    return orderedSkillsArray[0];
  }
  const other = orderedSkillsArray.length === 2 ? 'autre' : 'autres';
  return `${orderedSkillsArray[0]} et ${orderedSkillsArray.length - 1} ${other} acquis`;
})

const skillTooltipContent = computed(() => {
  if (!props.skills) {
    return '';
  }
  const skillsArray = props.skills.split(',');
  return skillsArray
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'case' }))
    .join(',');
})
</script>

<template>
  <span class="icon icon-info" :title="skillTooltipContent">{{ skillCellContent }}</span>
</template>

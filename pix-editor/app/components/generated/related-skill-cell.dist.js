import { computed } from 'vue';


import { toDisplayString as _toDisplayString, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

const _hoisted_1 = ["title"]

export default { render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock("span", {
    class: "icon icon-info",
    title: _ctx.skillTooltipContent
  }, _toDisplayString(_ctx.skillCellContent), 9 /* TEXT, PROPS */, _hoisted_1))
},
  props: {
  skills: Array,
},
  setup(__props, { expose: __expose }) {
  __expose();

const props = __props;

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

const __returned__ = { props, skillCellContent, skillTooltipContent, computed }

return __returned__
}

}
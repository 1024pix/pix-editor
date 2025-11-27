import Component from '@glimmer/component';
import CompetenceProfile from 'pixeditor/components/target-profile/competence-profile';

export default class AreaProfile extends Component {
<template>{{#each this.filteredCompetences as |competence|}}
  <CompetenceProfile @competence={{competence}} @areaCode={{@area.code}} @displayTube={{@displayTube}} @level={{@level}} @selectedSkills={{@selectedSkills}} @showTubeDetails={{@showTubeDetails}} @clearTube={{@clearTube}} @setTubeLevel={{@setTubeLevel}} @filter={{@filter}} @isThematicResultMode={{@isThematicResultMode}} @displayThematicResultTube={{@displayThematicResultTube}} />
{{/each}}
</template>

get filteredCompetences() {
  const area = this.args.area;
  if (this.args.filter) {
    return area.sortedCompetences.filter((competence) => competence.selectedProductionTubeCount > 0);
  }
  return area.sortedCompetences;
}
}

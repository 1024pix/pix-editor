import Component from '@glimmer/component';

export default class StatisticsProductionComponent extends Component {
<template><h2 class="ui header">
  <i class="rocket icon"></i>
  <div class="content">
    En production
  </div>
</h2>
<div class="ui three column padded grid">
  <div class="column">
    <div class="ui blue segment center aligned">
      <div class="ui header">
        {{this.productionTubeTotal}}
        <div class="sub header">
          Tubes
        </div>
      </div>
    </div>
  </div>
  <div class="column">
    <div class="ui blue segment center aligned">
      <div class="ui header">
        {{this.productionSkillTotal}}
        <div class="sub header">
          Acquis
        </div>
      </div>
    </div>
  </div>
  <div class="column">
    <div class="ui blue segment center aligned">
      <div class="ui header">
        {{this.productionChallengeTotal}}
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
      {{#each this.productionData as |item|}}
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
      {{/each}}
    </div>
  </div>
</div>
</template>

get productionTubeCounts() {
  return this.productionCounts((competence) => {
    return competence.productionTubeCount;
  });
}

get productionSkillCounts() {
  return this.productionCounts((competence) => {
    return competence.tubes.reduce((current, tube) => {
      return current + tube.productionSkillCount;
    }, 0);
  });
}

get productionChallengeCounts() {
  return this.productionCounts((competence) => {
    return competence.tubes.reduce((current, tube) => {
      return current + tube.liveSkills.reduce((current, skill) => {
        return current + skill.challengesArray.filter((challenge) => challenge.isValidated).length;
      }, 0);
    }, 0);
  });
}

productionCounts(callbackCount) {
  return this.args.areas.reduce((current, area) => {
    return area.competencesArray.reduce((current, competence) => {
      current[competence.code] = callbackCount(competence);
      return current;
    }, current);
  }, {});
}

get productionData() {
  return this.args.competenceCodes.map((code) => ({
    name: code,
    tubes: this.productionTubeCounts[code],
    skills: this.productionSkillCounts[code],
    challenges: this.productionChallengeCounts[code],
    rate: (this.productionChallengeCounts[code] * 100 / this.productionChallengeTotal).toFixed(1),
  }));
}

get productionTubeTotal() {
  return this.productionTotal(this.productionTubeCounts);
}

get productionSkillTotal() {
  return this.productionTotal(this.productionSkillCounts);
}

get productionChallengeTotal() {
  return this.productionTotal(this.productionChallengeCounts);
}

productionTotal(productionCounts) {
  return Object.values(productionCounts).reduce((current, value) => current + value, 0);
}
}

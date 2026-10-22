import { PixIcon } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';

export default class StatisticsProductionComponent extends Component {
  <template>
    <h2 class="statistics__section-heading">
      <PixIcon @name="bolt" @ariaHidden={{true}} />
      En production
    </h2>
    <div class="statistics-production__tiles">
      <div class="statistics__card statistics__card--tertiary">
        <span class="statistics__card-value">{{this.productionTubeTotal}}</span>
        <span class="statistics__card-label">Tubes</span>
      </div>
      <div class="statistics__card statistics__card--tertiary">
        <span class="statistics__card-value">{{this.productionSkillTotal}}</span>
        <span class="statistics__card-label">Acquis</span>
      </div>
      <div class="statistics__card statistics__card--tertiary">
        <span class="statistics__card-value">{{this.productionChallengeTotal}}</span>
        <span class="statistics__card-label">Épreuves</span>
      </div>
    </div>
    <div class="statistics__card statistics__card--tertiary statistics__table statistics-production__table">
      <div class="statistics__cell statistics__cell--head">Compétence</div>
      <div class="statistics__cell statistics__cell--head">Tubes</div>
      <div class="statistics__cell statistics__cell--head">Acquis</div>
      <div class="statistics__cell statistics__cell--head">Épreuves</div>
      <div class="statistics__cell statistics__cell--head statistics-production__cell--part">
        Part
      </div>
      {{#each this.productionData as |item|}}
        <div class="statistics__cell">{{item.name}}</div>
        <div class="statistics__cell">{{item.tubes}}</div>
        <div class="statistics__cell">{{item.skills}}</div>
        <div class="statistics__cell">{{item.challenges}}</div>
        <div class="statistics__cell statistics-production__cell--part">{{item.rate}}&nbsp;%</div>
      {{/each}}
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
        return (
          current +
          tube.liveSkills.reduce((current, skill) => {
            return current + skill.challengesArray.filter((challenge) => challenge.isValidated).length;
          }, 0)
        );
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
      rate: ((this.productionChallengeCounts[code] * 100) / this.productionChallengeTotal).toFixed(1),
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

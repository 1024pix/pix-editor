import { PixIcon, PixTooltip } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';

import ThemeProfile from './theme-profile';

export default class CompetenceProfile extends Component {
  get filteredTheme() {
    const competence = this.args.competence;
    if (this.args.filter) {
      return competence.sortedThemes.filter((theme) => theme.hasSelectedProductionTube);
    }
    return competence.sortedThemes.filter((theme) => theme.hasProductionTubes);
  }

  <template>
    <div class="competence-profile-cell">
      <h2
        data-test-competence-profile
        id="competence-profile-anchor-{{@competence.id}}"
        class="competence-profile area-profile-{{@areaCode}}"
      >
        <div class="competence-profile__competence-title">
          {{@competence.code}}
          <div>{{@competence.title}}</div>
        </div>
        <PixTooltip @id="info-tooltip" @position="left" @isWide={{true}} @isLight={{true}}>
          <:triggerElement>
            <PixIcon aria-describedby="info-tooltip" @name="info" />
          </:triggerElement>
          <:tooltip>
            {{@competence.description}}
          </:tooltip>
        </PixTooltip>
      </h2>
      {{#each this.filteredTheme as |theme|}}
        <ThemeProfile
          @showTubeDetails={{@showTubeDetails}}
          @filter={{@filter}}
          @isThematicResultMode={{@isThematicResultMode}}
          @displayTube={{@displayTube}}
          @displayThematicResultTube={{@displayThematicResultTube}}
          @clearTube={{@clearTube}}
          @setTubeLevel={{@setTubeLevel}}
          @theme={{theme}}
        />
      {{/each}}
      <div class="competence-profile__footer">
        {{#if @isThematicResultMode}}
          {{@competence.selectedThematicResultTubeCount}}
          /{{@competence.selectedProductionTubeCount}}
        {{else}}
          {{@competence.selectedProductionTubeCount}}
          /{{@competence.productionTubeCount}}
        {{/if}}
      </div>
    </div>
  </template>
}

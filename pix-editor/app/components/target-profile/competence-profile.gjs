import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
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
    <div class="ui grid">
      <h2 data-test-competence-profile id="competence-profile-anchor-{{@competence.id}}" class="row competence-profile area-profile-{{@areaCode}}">
        <div class="column competence-code right aligned">
          {{@competence.code}}
        </div>
        <div class="fourteen wide column">
          <div class="competence-title">{{@competence.title}}</div>
        </div>
        <div class="column center competence-info">
          <PixTooltip
            @id="info-tooltip"
            @position="left"
            @isWide ={{true}}
            @isLight ={{true}}
          >
            <:triggerElement>
              <PixIcon aria-describedby="info-tooltip" @name="info"/>
            </:triggerElement>
            <:tooltip>
              {{@competence.description}}
            </:tooltip>
          </PixTooltip>
        </div>
      </h2>
      {{#each this.filteredTheme as |theme|}}
        <ThemeProfile @showTubeDetails={{@showTubeDetails}}
                                     @filter={{@filter}}
                                     @isThematicResultMode={{@isThematicResultMode}}
                                     @displayTube={{@displayTube}}
                                     @displayThematicResultTube={{@displayThematicResultTube}}
                                     @clearTube={{@clearTube}}
                                     @setTubeLevel={{@setTubeLevel}}
                                     @theme={{theme}}/>
      {{/each}}
      <div class="row">
        <div class="fifteen wide column"></div>
        {{#if @isThematicResultMode}}
          <div class="column selected-tube-count">{{@competence.selectedThematicResultTubeCount}}
            /{{@competence.selectedProductionTubeCount}}</div>
        {{else}}
          <div class="column selected-tube-count">{{@competence.selectedProductionTubeCount}}
            /{{@competence.productionTubeCount}}</div>
        {{/if}}

      </div>
    </div>

  </template>
}

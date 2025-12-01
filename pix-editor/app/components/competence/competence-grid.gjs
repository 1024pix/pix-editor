import Component from '@glimmer/component';
import CompetenceGridThematic from 'pixeditor/components/competence/competence-grid-thematic';

export default class CompetenceCompetenceGridComponent extends Component {
  <template>
    <div class="competence-grid">
      <table class="ui celled table definition tubes">
        <tbody>
          {{#each this.thematicOverviewsOrThematics as |thematicOverviewOrThematic|}}
            <CompetenceGridThematic
              @languageFilter={{@languageFilter}}
              @section={{@section}}
              @view={{@view}}
              @thematic={{thematicOverviewOrThematic.thematic}}
              @thematicOverview={{thematicOverviewOrThematic.thematicOverview}}
              @newTube={{@newTube}}
              @displaySortTubesPopIn={{@displaySortTubesPopIn}}
              @link={{@link}}
            />
          {{/each}}
        </tbody>
      </table>
    </div>
  </template>

  get isOverview() {
    return this.args.competenceOverview != null;
  }

  get thematicOverviewsOrThematics() {
    if (this.isOverview) {
      return this.args.competenceOverview.thematicOverviews.map((thematicOverview) => ({ thematicOverview }));
    }
    return this.args.competence.sortedThemes.map((thematic) => ({ thematic }));
  }
}

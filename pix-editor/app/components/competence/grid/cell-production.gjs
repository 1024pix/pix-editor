import Component from '@glimmer/component';
import { LinkTo } from '@ember/routing';

export default class CellProduction extends Component {
  <template>
    <td data-test-skill-cell class="skill-cell production {{this.alertCSS}}">
      <LinkTo data-test-skill-cell-link @route={{@link}} @model={{@skillOverview.prototypeId}} class="skill-cell__link">
        {{@skillOverview.name}}
        <div class="alternative">
          <span data-test-production-alternative-length class="production" title="Nombre d'épreuves en production">
            {{@skillOverview.validatedChallengesCount}}
          </span>
          {{#if @skillOverview.proposedChallengesCount}}
            <span data-test-draft-alternative-length class="draft" title="Nombre d'épreuves en cours de construction">
              ({{@skillOverview.proposedChallengesCount}})
            </span>
          {{/if}}
          {{#unless @skillOverview.isPrototypeDeclinable}}
            <span class="not-declinable">NR</span>
          {{/unless}}
        </div>
      </LinkTo>
    </td>
  </template>

  get alertCSS() {
    if (this.args.skillOverview.validatedChallengesCount > 0) {
      return '';
    }
    if (this.args.skillOverview.proposedChallengesCount > 0) {
      return 'warning';
    }
    return 'danger';
  }
}

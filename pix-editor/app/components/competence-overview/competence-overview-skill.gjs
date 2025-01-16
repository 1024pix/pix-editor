import { concat } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';

export default class CompetenceOverviewSkill extends Component {

  get modifier() {
    if (!this.args.skillOverview) return 'no-skill';
    if (this.args.skillOverview.validatedChallengesCount) return 'validated';
    if (this.args.skillOverview.proposedChallengesCount) return 'proposed';
    return 'empty';
  }

  <template>
    <div ...attributes class={{concat "production-skill-overview production-skill-overview--" this.modifier}}>
      {{#if @skillOverview}}
        <LinkTo
          @route={{if this.args.locale "authenticated.v2.competence-overview.localized-challenges" "authenticated.v2.competence-overview.challenges"}}
          @model={{@skillOverview.airtableId}}
        >
          <span class="production-skill-overview__name">{{@skillOverview.name}}</span>
          <span class="production-skill-overview__details">
            <span title="Nombre d'épreuves en production">
              {{@skillOverview.validatedChallengesCount}}
            </span>
            {{#if @skillOverview.proposedChallengesCount}}
              <span title="Nombre d'épreuves en cours de construction">
                ({{@skillOverview.proposedChallengesCount}})
              </span>
            {{/if}}
            {{#unless @skillOverview.isPrototypeDeclinable}}
              <span class="">NR</span>
            {{/unless}}
          </span>
        </LinkTo>
      {{/if}}
    </div>
  </template>
}

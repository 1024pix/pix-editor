import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';

export default class CompetenceOverviewSkill extends Component {

  get modifier() {
    if (this.args.skillOverview.validatedChallengesCount) return 'validated';
    if (this.args.skillOverview.proposedChallengesCount) return 'proposed';
    return 'empty';
  }

  get classes() {
    let classes = `production-skill-overview-action production-skill-overview-action--${this.modifier}`;
    if (this.args.isActive) {
      classes += ' active';
    }
    return classes;
  }

  @action
  skillClicked() {
    this.args.onSkillClicked(this.args.skillOverview.id);
  }

  <template>
    <div ...attributes class="production-skill-overview">
      {{#if @skillOverview}}
        <LinkTo
          class={{this.classes}}
          @route={{if this.args.locale "authenticated.v2.competence-overview.localized-challenges" "authenticated.v2.competence-overview.challenges"}}
          @model={{@skillOverview.airtableId}}
          {{on "click" this.skillClicked}}
        >
          <span>{{@skillOverview.name}}</span>
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

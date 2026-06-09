import { service } from '@ember/service';
import Component from '@glimmer/component';
import CompetenceOverview from 'pixeditor/components/competence-overview/competence-overview';

export default class CompetenceOverviewTemplate extends Component {
  @service router;

  get displayRouteOverview() {
    return [
      'authenticated.v2.competence-overview.index',
      'authenticated.v2.competence-overview.localized-challenges.index',
      'authenticated.v2.competence-overview.loading',
      'authenticated.v2.competence-overview.challenges.index',
    ].includes(this.router.currentRouteName);
  }

  <template>
    {{#if this.displayRouteOverview}}
      <CompetenceOverview
        @competenceOverview={{@controller.model.competenceOverview}}
        @locale={{@controller.model.locale}}
      />
    {{/if}}
    {{outlet}}
  </template>
}

import CompetenceOverview from 'pixeditor/components/competence-overview/competence-overview';
import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class CompetenceOverviewTemplate extends Component {
  @service router;

  get displayRouteOverview() {    return [
      'authenticated.v2.competence-overview.index',
      'authenticated.v2.competence-overview.localized-challenges',
      'authenticated.v2.competence-overview.loading',
      'authenticated.v2.competence-overview.challenges'
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


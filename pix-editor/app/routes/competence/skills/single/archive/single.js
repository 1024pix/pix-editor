import AuthenticatedRoute from '../../../../authenticated';
import { inject as service } from '@ember/service';

export default class CompetenceSkillsSingleArchiveSingleRoute extends AuthenticatedRoute {

  @service store;
  model(params) {
    return this.store.findRecord('challenge', params.challenge_id);
  }

  templateName = 'competence/prototypes/single';
}

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CompetenceSkillsSingleArchiveSingleRoute extends Route {

  @service store;
  model(params) {
    return this.store.findRecord('challenge', params.challenge_id);
  }

  templateName = 'authenticated/competence/prototypes/single';
}

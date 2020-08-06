import Route from '@ember/routing/route';

export default class CompetenceSkillsSingleArchiveSingleRoute extends Route {
  model(params) {
    return this.store.findRecord('challenge', params.challenge_id);
  }

  templateName = 'competence/prototypes/single';
}

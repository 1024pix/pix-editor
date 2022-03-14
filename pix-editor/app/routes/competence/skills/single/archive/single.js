import AuthenticatedRoute from '../../../../authenticated';

export default class CompetenceSkillsSingleArchiveSingleRoute extends AuthenticatedRoute {
  model(params) {
    return this.store.findRecord('challenge', params.challenge_id);
  }

  templateName = 'competence/prototypes/single';
}

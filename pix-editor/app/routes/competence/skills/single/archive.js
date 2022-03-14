import AuthenticatedRoute from '../../../authenticated';

export default class CompetenceSkillsSingleArchiveRoute extends AuthenticatedRoute {
  renderTemplate() {
    this.render('competence/skills/single/archive', {
      into: 'competence',
      outlet: 'mainRight'
    });
  }
}


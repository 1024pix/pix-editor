import Route from '@ember/routing/route';

export default class CompetenceSkillsSingleArchiveRoute extends Route {
  renderTemplate() {
    this.render('competence/skills/single/archive', {
      into: 'competence',
      outlet: 'mainRight'
    });
  }
}


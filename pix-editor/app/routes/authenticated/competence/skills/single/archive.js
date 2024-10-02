import Route from '@ember/routing/route';

export default class CompetenceSkillsSingleArchiveRoute extends Route {
  async afterModel(skill) {
    await skill.challenges;
  }
}


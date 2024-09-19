import { action } from '@ember/object';
import Route from '@ember/routing/route';

export default class SkillsRoute extends Route {

  async model() {
    const competence = this.modelFor('authenticated.competence');
    if (this.refreshing) {
      const themes = await competence.hasMany('rawThemes').reload();
      const themesTubes = await Promise.all(themes.map((theme) => theme.hasMany('rawTubes').reload()));
      await Promise.all(themesTubes.flatMap((tubes) => tubes.map((tube) => tube.hasMany('rawSkills').reload())));
      this.refreshing = false;
    } else {
      const themes = await competence.rawThemes;
      const themesTubes = await Promise.all(themes.map((theme) => theme.rawTubes));
      await Promise.all(themesTubes.flatMap((tubes) => tubes.map((tube) => tube.rawSkills)));
    }
    return competence;
  }

  @action
  refreshModel() {
    this.refreshing = true;
    this.refresh();
  }
}

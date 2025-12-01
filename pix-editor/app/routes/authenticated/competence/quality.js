import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class QualityRoute extends Route {
  @service router;

  refreshing = false;

  async model() {
    const competence = this.modelFor('authenticated.competence');
    if (this.refreshing) {
      const themes = await competence.hasMany('rawThemes').reload();
      const themesTubes = await Promise.all(themes.map((theme) => theme.hasMany('rawTubes').reload()));
      const tubesSkills = await Promise.all(
        themesTubes.flatMap((tubes) => tubes.map((tube) => tube.hasMany('rawSkills').reload())),
      );
      await Promise.all(tubesSkills.flatMap((skills) => skills.map((skill) => skill.hasMany('challenges').reload())));
      this.refreshing = false;
    } else {
      const themes = await competence.rawThemes;
      const themesTubes = await Promise.all(themes.map((theme) => theme.rawTubes));
      const tubesSkills = await Promise.all(themesTubes.flatMap((tubes) => tubes.map((tube) => tube.rawSkills)));
      await Promise.all(tubesSkills.flatMap((skills) => skills.map((skill) => skill.challenges)));
    }
    return competence;
  }

  @action
  refreshModel() {
    this.refreshing = true;
    this.refresh();
  }
}

import Component from '@ember/component';

export default Component.extend({

  actions: {

    showTube(tube) {
      const showTubeDetails = this.get('showTubeDetails');
      const isSelected = tube.get('selectedLevel');
      if (showTubeDetails) {
        return this.get('displayTube')(tube)
      }
      if (isSelected) {
        return this.get("clearTube")(tube)
      }
      const productionSkill = tube.get("productionSkills");
      const level = productionSkill[productionSkill.length - 1].get('level');
      const skillIds = productionSkill.reduce((ids, skill) => {
        if (skill) {
          skill.set('_selected', true);
          ids.push(skill.id);
        }
        return ids;
      }, []);
      this.get('setTubeLevel')(tube, level, skillIds);
    }
  }
});

import Component from '@ember/component';
import {computed} from '@ember/object';

export default Component.extend({

  filterTube: computed('competence.productionTubes.@each.selectedLevel', 'filter', function () {
    const filter = this.get('filter');
    const competence = this.get('competence');
    if(filter){
      return competence.get('productionTubes').filter(tube => {
        return tube.selectedLevel
      })
    }
    return competence.get('productionTubes');
  }),

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

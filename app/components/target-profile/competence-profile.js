import Component from '@ember/component';

export default Component.extend({

  actions: {

    showTube(tube) {
      const extended = this.get('extended');
      const isSelected = tube.get('selectedLevel');
      console.log('isSelected', extended, isSelected)
      if (extended) {
        return this.get('displayTube')(tube)
      }
      if (isSelected) {
        return this.get("clearTube")(tube)
      }
      return tube.get("productionSkills")
        .then(productionSkill => {
          const level = productionSkill[productionSkill.length-1].get('level');
          const skillIds = productionSkill.reduce((ids, skill) => {
            if (skill) {
              skill.set('_selected', true);
              ids.push(skill.id);
            }
            return ids;
          }, []);
          this.get('setTubeLevel')(tube, level, skillIds);
        })

    }
  }
});

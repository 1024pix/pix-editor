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
    clickOnTube(tube) {
      const showTubeDetails = this.get('showTubeDetails');
      const isSelected = tube.get('selectedLevel');
      if (showTubeDetails) {
        this.get('displayTube')(tube);
      } else if (isSelected) {
        this.get('clearTube')(tube);
      } else {
        this.get('setTubeLevel')(tube);
      }
    }
  }
});

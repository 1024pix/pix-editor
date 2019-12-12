import Skill from '../skills/single';

export default Skill.extend({
  actions:{
    close() {
      this.set("maximized", false);
      this.transitionToRoute('competence.quality', this.get('competence'));
    }
  }
});

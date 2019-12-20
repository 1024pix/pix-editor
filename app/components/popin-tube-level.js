import Component from '@ember/component';
import { computed } from '@ember/object';


export default Component.extend({
  tube:null,
  skills:computed("tube", "selectedSkills", function() {
    let tube = this.get('tube');
    if (tube) {
      const skills = tube.get('productionSkills');
      let selected = this.get("selectedSkills");
      return skills.reduce((orderedSkills, skill) => {
        let level = skill.get('level');
        skill.set("_selected", selected.includes(skill.id));
        orderedSkills[level-1] = skill;
        return orderedSkills;
      }, [null, null, null, null, null, null, null, null]);
    } else {
      return [];
    }
  }),
  mayUnset:computed("level", function() {
    let value = this.get("level");
    return value != false;
  }),
  actions: {
    select(skill) {
      let level = skill.get("level");
      let skillIds = this.get("skills").reduce((ids, skill) => {
        if (skill && (skill.get("level")<=level)) {
          ids.push(skill.id);
        }
        return ids;
      }, []);
      this.get("setTubeLevel")(this.get("tube"), level, skillIds);
      this.set('display', false);
    },
    clear() {
      this.get("clearTube")(this.get("tube"));
      this.set('display', false);
    },
    closeModal(){
      this.set('display', false);
    }
  }

});

import Component from '@ember/component';
import { computed } from '@ember/object';
import DS from 'ember-data';

export default Component.extend({
  tagName:"",
  tube:null,
  skills:computed("tube", "selectedSkills", function() {
    let tube = this.get('tube');
    if (tube) {
      return DS.PromiseArray.create({
        promise:tube.get('skills')
          .then(skills => {
            let selected = this.get("selectedSkills");
            return skills.reduce((orderedSkills, skill) => {
              let level = skill.get('level');
              skill.set("_selected", selected.includes(skill.id));
              orderedSkills[level-1] = skill;
              return orderedSkills;
            }, [null, null, null, null, null, null, null, null]);
          })
        });
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
      this.get("set")(this.get("tube"), level, skillIds);
      this.get("closed")();
    },
    unset() {
      this.get("unset")(this.get("tube"));
      this.get("closed")();
    }
  }

});

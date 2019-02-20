import UiModal from 'semantic-ui-ember/components/ui-modal';
import { computed } from '@ember/object';
import DS from 'ember-data';
import $ from 'jquery';


export default UiModal.extend({
  classNameBindings: ['class'],
  tube:null,
  willInitSemantic(settings) {
    this._super(...arguments);
    // remove any previously created modal with same class name
    $(`.${this.get('class')}`).remove();
    settings.detachable = true;
  },
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
      this.get("setTubeLevel")(this.get("tube"), level, skillIds);
      this.execute('hide');
    },
    clear() {
      this.get("clearTube")(this.get("tube"));
      this.execute('hide');
    }
  }

});

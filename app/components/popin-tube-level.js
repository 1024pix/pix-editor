import Component from '@ember/component';
import { observer, computed } from '@ember/object';
import { inject as service } from "@ember/service";
import DS from 'ember-data';
import $ from "jquery";

export default Component.extend({
  tube:null,
  paginatedQuery:service(),
  displayManager:observer("display", function() {
    if (this.get("display")) {
      $(".popin-tube-level").modal('show');
    }
  }),
  skills:computed("tube", "selectedSkills", function() {
    let tube = this.get("tube");
    if (tube) {
      let pq = this.get("paginatedQuery");
      let recordsText = "OR(RECORD_ID() = '"+tube.get("skillIds").join("',RECORD_ID() ='")+"')";
      return DS.PromiseArray.create({
        promise: pq.query("skill", {filterByFormula:recordsText, sort: [{field: "Level", direction: "asc"}]}).then(skills => {
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
      $(".popin-tube-level").modal('hide');
    },
    unset() {
      this.get("unset")(this.get("tube"));
      $(".popin-tube-level").modal('hide');
    }
  }

});

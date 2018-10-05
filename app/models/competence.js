import DS from 'ember-data';
import {computed} from '@ember/object';


export default DS.Model.extend({
  init() {
    this._super(...arguments);
    /*this.skills = [];
    this.workbenchSkills = [];
    this.sortedChallenges = {production:[], workbench:[], noSkill:[]};*/
  },
  workbenchLoaded:false,
  needsRefresh:false,
  area: DS.belongsTo("area"),
  name: DS.attr("string", { readOnly: true }),
  code: DS.attr(),
  tubes: DS.hasMany("tube"),
  sortedTubes:computed('tubes.[]', function() {
    return DS.PromiseArray.create({
      promise:this.get('tubes')
        .then(tubes => {
          return tubes.filterBy('name');
        })
    });
  }),
  skillIds:computed("tubes.[]", function() {
    return this.get('tubes')
    .then(tubes => {
      return tubes.reduce((ids, tube) => {
        return ids.concat(tube.hasMany('skills').ids());
      }, []);
    });
  }),
  loaded:computed("tubes.[]", function() {
    return this.get("tubes")
    .then(tubes => {
      let waitForTubes = tubes.reduce((promises, tube) => {
        promises.push(tube.get('loaded'));
        return promises;
      }, []);
      return Promise.all(waitForTubes);
    })
    .then(() => {
      return true;
    })
  }),
  tubeCount:computed("tubes", function() {
    return this.get("tubes").length;
  }),
  skillCount:computed("tubes.[]", function() {
    return DS.PromiseObject.create({
      promise:this.get('tubes')
        .then(tubes => {
          let getCounts = tubes.reduce((promises, tube) => {
            promises.push(tube.get('skillCount'));
            return promises;
          }, []);
          return Promise.all(getCounts);
        })
        .then(counts => {
          return counts.reduce((count, value)=> {
            return count+value;
          },0);
        })
    });
  }),
  refresh() {
    return this.hasMany('tubes').reload()
    .then(tubes => {
      let refreshTubes = tubes.reduce((promises, tube) => {
        promises.push(tube.refresh());
        return promises;
      }, []);
      return Promise.all(refreshTubes);
    });
  }
  /*productionChallengeIds:computed("skills", function() {
    return this.get("skills").reduce((current, skill) => {
      return current.concat(skill.get("challengeIds"));
    }, []);
  }),
  workbenchChallengeIds:computed("workbenchSkills", function() {
    return this.get("workbenchSkills").reduce((current, skill) => {
      return current.concat(skill.get("challengeIds"));
    }, []);
  }),
  challenges:computed("skills", "workbenchSkills", "sortedChallenges", function() {
    const productionChallenges = this.get("sortedChallenges.production");
    const workbenchChallenges = this.get("sortedChallenges.workbench");
    const noSkillChallenges = this.get("sortedChallenges.noSkill");
    let skills = this.get("skills");
    let orderedChallenges = productionChallenges.reduce((current, challenge) => {
      current[challenge.get("id")] = challenge;
      return current;
    }, {});
    let orderedWorkbenchChallenges = workbenchChallenges.reduce((current, challenge) => {
      current[challenge.get("id")] = challenge;
      return current;
    }, {});
    let workbenchChallengeIdsBySkill = this.get("workbenchSkills").reduce((current, workbenchSkill) => {
      let challengeIds = workbenchSkill.get("challengeIds");
      if (challengeIds) {
        current[workbenchSkill.get("skillId")] = challengeIds;
      }
      return current;
    }, {});

    skills.forEach((skill) => {
      let template = null;
      let alternativeCount = 0;
      let alternatives = [];
      let ids = skill.get("challengeIds");
      if (ids) {
        let set = ids.reduce((current, id) => {
          let challenge = orderedChallenges[id];
          if (challenge) {
            current.push(challenge);
            if (challenge.get("template")) {
              if (!template || challenge.get("validated")) {
                template = challenge;
              }
            } else {
              alternatives.push(challenge);
              alternativeCount++;
            }
          }
          return current;
        }, []);
        skill.set("challenges", set);
        if (template) {
          skill.set("template", template);
        }
        skill.set("alternativeCount", alternativeCount);
        let workbenchAlternatives = [];
        if (workbenchChallengeIdsBySkill[skill.get("id")]) {
          workbenchAlternatives = workbenchChallengeIdsBySkill[skill.get("id")].reduce((current, id) => {
            if (orderedWorkbenchChallenges[id]) {
              current.push(orderedWorkbenchChallenges[id]);
            }
            return current;
          }, []);
          skill.set("workbenchChallenges", workbenchAlternatives);
        }
        if (template) {
          template.set("sortedAlternatives", {production:alternatives, workbench:workbenchAlternatives});
        }
      }
    })
    return noSkillChallenges.reduce((current, value) => {
      current.push(value);
      return current;
    }, Object.values(orderedChallenges).filter((value) => {
      return value.get("template");
    }));
  }),
  challengeCount:computed("challenges", function() {
    return this.get("challenges").length;
  }),
  tubes:computed("skills", function() {
    const skills = this.get("skills");
    let set = skills.reduce((current, skill) => {
      let result = findTubeName.exec(skill.get("name"));
      if (result && result[1] && result[2]) {
        let tubeName = result[1];
        let index = parseInt(result[2]);
        if (!current[tubeName]) {
          current[tubeName] = [false, false, false, false, false, false, false];
        }
        current[tubeName][index-1] = skill;
      }
      return current;
    }, {});
    return Object.keys(set).reduce((current, key) => {
      current.push({name:key, skills:set[key]});
      return current;
    }, []);
  }),*/


});

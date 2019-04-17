import DS from "ember-data";
import {computed} from "@ember/object";
import {inject as service} from "@ember/service";

export default DS.Model.extend({
  skills:DS.hasMany('skill'),
  competence:DS.attr(),
  instructions:DS.attr(),
  type:DS.attr(),
  suggestion:DS.attr(),
  answers:DS.attr(),
  t1:DS.attr(),
  t2:DS.attr(),
  t3:DS.attr(),
  illustration:DS.attr(),
  attachments:DS.attr(),
  pedagogy:DS.attr(),
  author:DS.attr(),
  declinable:DS.attr(),
  version:DS.attr('number'),
  genealogy:DS.attr(),
  skillNames:DS.attr({readOnly:true}),
  status:DS.attr(),
  preview:DS.attr({readOnly:true}),
  pixId:DS.attr(),
  scoring:DS.attr(),
  timer:DS.attr('number'),
  embedURL:DS.attr(),
  embedTitle:DS.attr(),
  embedHeight:DS.attr('number'),
  alternativeVersion:DS.attr('number'),
  accessibility1:DS.attr(),
  accessibility2:DS.attr(),
  spoil:DS.attr(),
  responsive:DS.attr(),
  alternativeText:DS.attr(),
  myStore:service("store"),
  config:service(),
  isTemplate:computed("genealogy", function(){
    return (this.get("genealogy") === "Prototype 1");
  }),
  isWorkbench:computed('skills', function() {
    return DS.PromiseObject.create({
      promise:this.get('skills')
        .then(skills => {
          const skill = skills.get('firstObject');
          if (skill) {
            return skill.get('name') === '@workbench';
          }
          return false;
        })
    });
  }),
  isValidated:computed("status", function(){
    let status = this.get("status");
    return ["validé", "validé sans test", "pré-validé"].includes(status);
  }),
  isSuggested:computed("status", function() {
    let status = this.get("status");
    return status === "proposé";
  }),
  notDeclinable:computed('declinable', function() {
    let declinable = this.get("declinable");
    return (declinable && declinable === "non");
  }),
  computedIndex:computed("pixId", function() {
    let pixId = this.get("pixId");
    if (pixId) {
      let parts = pixId.split("_");
      return parseInt(parts[parts.length - 1]);
    } else {
      return null;
    }
  }),
  statusCSS:computed("status", function() {
    let status = this.get("status");
    switch (status) {
      case "validé":
      case "validé sans test":
      case "pré-validé":
        return "validated";
      case "proposé":
        return "suggested";
      case "archive":
        return "archived";
    }
  }),
  isArchived: computed("status", function() {
    let status = this.get("status");
    return (status === "archive");
  }),
  archive() {
    this.set("status", "archive");
    return this.save();
  },
  validate() {
    this.set("status", "validé");
    return this.save();
  },
  _getJSON(fieldsToRemove) {
    let data = this.toJSON({includeId:false});
    delete data.pixId;
    if (data.illustration) {
      let illustration = data.illustration[0];
      data.illustration = [{url:illustration.url, filename:illustration.filename}];
    }
    if (data.attachments) {
      data.attachments = data.attachments.map(value => {
        return {url:value.url, filename:value.filename};
      })
    }
    if (fieldsToRemove) {
      fieldsToRemove.forEach((current) => {
        if (data[current]) {
          delete data[current];
        }
      });
    }
    return data;
  },
  clone() {
    let ignoredFields = ["skills", "author"];
    if (this.get("isTemplate")) {
      ignoredFields.push("version");
    } else {
      ignoredFields.push("alternativeVersion");
    }
    let data = this._getJSON(ignoredFields);
    data.status = "proposé";
    data.author = [this.get("config").get("author")];
    return this.get("skills")
    .then(skills => {
      data.skills = skills;
      return this.get("myStore").createRecord(this.constructor.modelName, data);
    });
  },
  derive() {
    return this.clone()
    .then(alternative => {
      alternative.set("version", this.get("version"));
      alternative.set("genealogy", "Décliné 1");
      return alternative;
    });
  },
  alternatives:computed('isTemplate','version', 'skills.@each.alternatives', function() {
    if (!this.get('isTemplate')) {
      return [];
    }
    let currentVersion = this.get('version');
    return DS.PromiseArray.create({
      promise:this.get('skills')
        .then((skills) => {
          let firstSkill = skills.firstObject;
          if (firstSkill) {
            return firstSkill.get('alternatives')
            .then(alternatives => {
              return alternatives.filter(alternative => {
                return (alternative.get('version') === currentVersion);
              }).sort((a, b) => {
                return a.get("alternativeVersion")>b.get("alternativeVersion");
              });
            });
          } else {
            return [];
          }
        })
    })
  }),
  firstSkill:computed('skills', function() {
    return DS.PromiseObject.create({
      promise:this.get('skills')
        .then((skills) => {
          return skills.firstObject;
        })
    });
  }),
  template:computed('isTemplate','version', 'firstSkill.templates', function() {
    if (this.get('isTemplate')) {
      return null;
    }
    let currentVersion = this.get('version');
    return DS.PromiseObject.create({
      promise:this.get('firstSkill')
        .then(firstSkill => {
          if (firstSkill) {
            return firstSkill.get('templates')
            .then(templates => {
              return templates.find(template => {
                return (template.get('version') === currentVersion);
              });
            });
          } else {
            return null;
          }
        })
    })
  }),
  productionAlternatives:computed("alternatives.@each.isValidated", function() {
    return DS.PromiseArray.create({
      promise:this.get("alternatives")
        .then(alternatives => {
          return alternatives.filter(alternative => {
            return alternative.get("isValidated");
          });
        })
    });
  }),
  draftAlternatives:computed("alternatives.@each.isValidated", function() {
    return DS.PromiseArray.create({
      promise:this.get("alternatives")
        .then(alternatives => {
          return alternatives.filter(alternative => {
            return !alternative.get("isValidated");
          });
        })
    });
  }),
  getNextAlternativeVersion() {
    return this.get("alternatives")
    .then(alternatives => {
      return alternatives.reduce((current, alternative) => {
        return Math.max(current, alternative.get("alternativeVersion"));
      }, 0)+1;
    });
  },
  isTextBased:computed("type", function() {
    let type = this.get("type");
    return ["QROC","QROCM","QROCM-ind","QROCM-dep"].includes(type);
  }),
  supportsScoring:computed("type", function() {
    return this.get("type") === "QROCM-dep";
  }),
  timerOn:computed("timer", {
    get() {
      let timer = this.get("timer");
      return (timer && timer>0)?true:false;
    },
    set(key, value) {
      let timer = this.get("timer");
      if (value) {
        if (!timer || timer === 0) {
          this.set("timer", 1);
        }
      } else {
        if (timer && timer > 0) {
          this.set("timer", 0);
        }
      }
      return value;
    }
  }),
  authorText:computed('author', function() {
    let author = this.get('author');
    if (author) {
      return author.join(', ');
    }
    return '';
  }),
  skillLevels:computed('skills', function() {
    return DS.PromiseArray.create({
      promise:this.get('skills')
        .then(skills => skills.reduce((current, skill) => {
          current.push(skill.get('level'));
          return current;
        }, []))
    });
  })
});

import DS from "ember-data";
import {computed} from "@ember/object";
import {inject as service} from "@ember/service";
import { A } from "@ember/array";

export default DS.Model.extend({
  init() {
    this._super(...arguments);
    this.sortedAlternatives = {production:[], workbench:[]};
  },
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
  version:DS.attr(),
  genealogy:DS.attr(),
  skillNames:DS.attr({readOnly:true}),
  skills:DS.attr(),
  workbench:false,
  status:DS.attr(),
  preview:DS.attr({readOnly:true}),
  pixId:DS.attr(),
  alternativeIndex:DS.attr(),
  scoring:DS.attr(),
  timer:DS.attr('number'),
  embedURL:DS.attr(),
  embedTitle:DS.attr(),
  embedHeight:DS.attr('number'),

  myStore:service("store"),
  config:service(),
  template:computed("genealogy", function(){
    return (this.get("genealogy") == "Prototype 1");
  }),
  validated:computed("status", function(){
    let status = this.get("status");
    return ["validated", "validé sans test", "pré-validé"].includes(status);
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
  alternativeCount:0,
  statusCSS:computed("status", function() {
    let status = this.get("status");
    switch (status) {
      case "validé":
        return "validated";
      case "validé sans test":
        return "validated_no_test";
      case "proposé":
        return "suggested";
      case "pré-validé":
        return "prevalidated";
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
  clone(fieldsToRemove) {
    let data = this._getJSON(fieldsToRemove);
    data.status = "proposé";
    return this.get("myStore").createRecord(this.constructor.modelName, data);
  },
  derive() {
    let data = this._getJSON(["competence", "skills", "skillNames"]);
    data.status = "proposé";
    data.genealogy = "Décliné 1";
    data.author = [this.get("config").get("author")];
    return this.get("myStore").createRecord("workbenchChallenge", data);
  },
  publish() {
    let data = this._getJSON(["competence", "skills", "alternativeIndex"]);
    data.workbench = false;
    return this.get("myStore").createRecord("challenge", data);
  },
  alternatives:computed("sortedAlternatives", function() {
    let set = this.get("sortedAlternatives");
    let productionAlternatives = set.production.toArray();
    let workbenchAlternatives = set.workbench.toArray();
    let result = new A();
    result.pushObjects(productionAlternatives);
    result.pushObjects(workbenchAlternatives);
    return result;
  }),
  alternativesCount:computed("alternatives", function() {
    return this.get("alternatives").length;
  }),
  nextComputedIndex:computed("alternatives", function() {
    return this.get("alternatives").reduce((current, alternative) => {
      let index = alternative.get("computedIndex");
      if (index && index >= current) {
        return index+1;
      } else {
        return current;
      }
    }, 1);
  }),
  joinedSkills:computed("skills", function() {
    let skills = this.get("skills");
    if (skills) {
      return skills.join(",");
    } else {
      return "";
    }
  }),
  productionAlternativeCount:computed("sortedAlternatives", function() {
    return this.get("sortedAlternatives").production.length;
  }),
  workbenchAlternativeCount:computed("sortedAlternatives", function() {
    return this.get("sortedAlternatives").workbench.length;
  }),
  isTextBased:computed("type", function() {
    let type = this.get("type");
    return ["QROC","QROCM","QROCM-ind","QROCM-dep"].includes(type);
  }),
  supportsScoring:computed("type", function() {
    return this.get("type") == "QROCM-dep";
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
  })
});

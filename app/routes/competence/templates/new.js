import Template from './single';
import DS from 'ember-data';
import { inject as service } from '@ember/service';

export default Template.extend({
  templateName: "competence/templates/single",
  config:service(),
  model(params) {
    //TODO: handle "fromSkill" param
    if (params.from) {
      return this.get("store").findRecord("challenge",params.from)
      .then((template) => {
        return template.clone();
      });
    } else {
      let newChallenge = this.get("store").createRecord("challenge", {competence:[this.modelFor("competence").id], status:"proposé", t1:true, t2:true, t3:true, genealogy:"Prototype 1", author:[this.get('config').get('author')]});
      return DS.PromiseObject.create({
        promise:this.modelFor('competence').get('workbenchSkill')
          .then(skill => {
            newChallenge.get('skills').pushObject(skill);
            return newChallenge;
          })
      });
    }
  },
  setupController(controller) {
    this._super(...arguments);
    controller.send("edit");
    controller.send("init");
  },
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('from', "");
    }
  }
});

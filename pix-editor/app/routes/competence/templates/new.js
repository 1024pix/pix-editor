import TemplateRoute from './single';
import {inject as service} from '@ember/service';

export default class NewRoute extends TemplateRoute {
  templateName = 'competence/templates/single';

  @service config;
  @service idGenerator;

  model(params) {
    //TODO: handle 'fromSkill' param
    if (params.from) {
      return this.store.findRecord('challenge',params.from)
        .then((template) => {
          return template.clone();
        });
    } else {
      const newChallenge = this.store.createRecord('challenge', {competence:[this.modelFor('competence').id], status:'proposé', t1:true, t2:true, t3:true, genealogy:'Prototype 1', author:[this.config.author], pixId:this.idGenerator.newId()});
      if (params.fromSkill) {
        return this.store.findRecord('skill', params.fromSkill)
          .then((skill) => {
            newChallenge.skills.pushObject(skill);
            return newChallenge;
          });
      }
      newChallenge.skills.pushObject(this.modelFor('competence').workbenchSkill);
      return newChallenge;
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.maximizeLeft(true);
    controller.send('edit');
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.from = '';
    }
  }
}

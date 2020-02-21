import classic from 'ember-classic-decorator';
import TemplateRoute from './single';
import { inject as service } from '@ember/service';

@classic
export default class NewRoute extends TemplateRoute {
  templateName = 'competence/templates/single';

  @service
  config;

  @service
  idGenerator

  model(params) {
    //TODO: handle 'fromSkill' param
    if (params.from) {
      return this.get('store').findRecord('challenge',params.from)
      .then((template) => {
        return template.clone();
      });
    } else {
      let newChallenge = this.get('store').createRecord('challenge', {competence:[this.modelFor('competence').id], status:'proposé', t1:true, t2:true, t3:true, genealogy:'Prototype 1', author:[this.get('config').get('author')], pixId:this.get('idGenerator').newId()});
      newChallenge.get('skills').pushObject(this.modelFor('competence').get('workbenchSkill'));
      return newChallenge;
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.set('maximized', true);
    controller.send('edit');
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('from', '');
    }
  }
}

import PrototypeRoute from './single';
import { inject as service } from '@ember/service';

export default class NewRoute extends PrototypeRoute {
  templateName = 'authenticated/competence/prototypes/single';

  @service config;
  @service idGenerator;
  @service store;

  async model(params) {
    if (params.from) {
      const prototype = await this.store.findRecord('challenge', params.from);
      return prototype.duplicate();
    } else {
      const newChallenge = this.store.createRecord('challenge', {
        competence: [this.modelFor('authenticated.competence').id],
        status: 'proposé',
        t1Status: true,
        t2Status: true,
        t3Status: true,
        genealogy: 'Prototype 1',
        author: [this.config.author],
        id: this.idGenerator.newId('challenge')
      });
      if (params.fromSkill) {
        const skill = await this.store.findRecord('skill', params.fromSkill);
        newChallenge.skill = skill;
        return newChallenge;
      }
      newChallenge.skill = this.modelFor('authenticated.competence').workbenchSkill;
      return newChallenge;
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('authenticated.competence');
    competenceController.maximizeLeft(true);
    controller.send('edit');
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.from = '';
    }
  }
}

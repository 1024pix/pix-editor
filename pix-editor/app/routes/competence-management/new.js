import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import AuthenticatedRoute from '../authenticated';

export default class CompetenceManagementNewRoute extends AuthenticatedRoute {
  templateName = 'competence-management/single';
  @service idGenerator;
  @service currentData;
  @service confirm;

  model(params) {
    const area = this.store.peekRecord('area', params.area_id);
    return area.get('competences')
      .then(competences => {
        const competence = this.store.createRecord('competence', {
          code: `${area.code}.${competences.length + 1}`,
          pixId: this.idGenerator.newId('competence'),
        });
        return { competence, area };
      });
  }

  async afterModel(model) {
    if (model) {
      const area = model.area;
      const framework = await area.framework;
      this.currentData.setFramework(framework);
    }
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.edition = true;
  }

  @action
  async willTransition(transition) {
    const controller = this.controllerFor('competence-management.new');
    const edition = controller.edition;
    if (edition && !confirm('Êtes-vous sûr de vouloir abandonner la création en cours ?')) {
      transition.abort();
    } else if (edition) {
      controller.store.deleteRecord(controller.competence);
      return true;
    } else {
      return true;
    }
  }
}

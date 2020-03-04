import TemplateRoute from '../../single';

export default class SingleRoute extends TemplateRoute {
  model(params) {
    return this.store.findRecord('challenge', params.alternative_id)
  }

  templateName = 'competence/templates/single';
}

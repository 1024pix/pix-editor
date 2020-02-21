import classic from 'ember-classic-decorator';
import TemplateRoute from '../../single';

@classic
export default class SingleRoute extends TemplateRoute {
  model(params) {
    return this.get('store').findRecord('challenge', params.alternative_id)
  }

  templateName = 'competence/templates/single';
}

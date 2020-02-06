import classic from 'ember-classic-decorator';
import Controller from '@ember/controller';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import {computed, action} from '@ember/object';

@classic
export default class ListController extends Controller {

  @controller('competence')
  parentController;

  @service
  access;

  @service
  config;

  @computed('config.access')
  get mayCreateTemplate() {
    return this.get('access').mayCreateTemplate();
  }

  @action
  close() {
    this.get('parentController').send('closeChildComponent');
  }

  @action
  newVersion() {
    const templates = this.get('model.sortedTemplates')
    if (templates.length>0) {
      let template = templates.get('firstObject');
      this.transitionToRoute('competence.templates.new', this.get('competence'), { queryParams: { from: template.get('id')}});
    } else {
      this.transitionToRoute('competence.templates.new', this.get('competence'), { queryParams: { fromSkill: this.get('model').get('id')}});
    }
  }
}

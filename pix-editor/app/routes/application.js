import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { formats } from 'pixeditor/ember-intl';

export default class ApplicationRoute extends Route {
  @service session;
  @service intl;

  async beforeModel() {
    await this.session.setup();
    this.intl.setFormats(formats);
  }
}

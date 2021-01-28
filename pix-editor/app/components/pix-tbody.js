import EmberTbody from 'ember-table/components/ember-tbody/component';
import ENV from 'pixeditor/config/environment';

export default class PixTbody extends EmberTbody {
  get renderAll() {
    return ENV.environment === 'test';
  }
}

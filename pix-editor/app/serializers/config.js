import ApplicationSerializer from './application';

export default class ConfigSerializer extends ApplicationSerializer {

  extractId() {
    return 'pix-editor-global-config';
  }
}

import ApplicationAdapter from './application';

export default class ConfigAdapter extends ApplicationAdapter {

  urlForFindRecord() {
    const baseUrl = this.buildURL();
    return `${baseUrl}/config`;
  }
}

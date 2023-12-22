import ApplicationAdapter from './application';

export default class MissionSummaryAdapter extends ApplicationAdapter {
  urlForQuery() {
    const baseUrl = this.buildURL();
    return `${baseUrl}/missions`;
  }
}

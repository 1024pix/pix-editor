import ApplicationAdapter from './application';

export default class CompetenceOverviewAdapter extends ApplicationAdapter {
  urlForFindRecord(id, modelName, snapshot) {
    let url = this.buildURL('competences', id, snapshot);
    if (snapshot.adapterOptions?.locale) url += `?locale=${snapshot.adapterOptions.locale}`;
    return url;
  }
}

import ApplicationAdapter from './application';

export default class CompetenceOverviewAdapter extends ApplicationAdapter {

  urlForFindRecord(id) {
    const [competenceId, view, locale] = id.split(':');
    let url = this.buildURL('competences', competenceId);
    url += `/overviews/${view}`;
    if (locale) url += `?locale=${locale}`;
    return url;
  }
}

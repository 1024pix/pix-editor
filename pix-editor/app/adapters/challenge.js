import ApplicationAdapter from './application';

export default class ChallengeAdapter extends ApplicationAdapter {
  coalesceFindRequests = true;

  groupRecordsForFindMany(store, snapshots) {
    const groups = [];
    for (let i = 0; i < snapshots.length; i += 100) {
      groups.push(snapshots.slice(i, i + 100));
    }
    return groups;
  }

  async findMany(store, type, ids, snapshots) {
    const url = this.buildURL(type.modelName, ids, snapshots, 'findMany');
    return this.ajax(url, 'GET', { data: { filter: { ids } } });
  }

}

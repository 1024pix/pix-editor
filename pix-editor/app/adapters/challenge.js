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

  updateRecord(store, type, snapshot) {
    console.log(snapshot);
    const adapterOptions = snapshot.adapterOptions;
    console.log(adapterOptions);
    if (adapterOptions.validate) {
      console.log('is validate');
      const { alternativeIdsToValidate, author, changelog } = adapterOptions.validate;
      const payload = this.serialize(snapshot);
      payload.author = author;
      payload.changelog = changelog;
      payload.alternativeIdsToValidate = alternativeIdsToValidate;
      const url = this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot) + '/validate';
      return this.ajax(url, 'PATCH', { data: payload });
    }
    return super.updateRecord(...arguments);
  }
}

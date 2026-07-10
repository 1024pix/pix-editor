import ApplicationAdapter from './application';

export default class ChallengeAdapter extends ApplicationAdapter {
  coalesceFindRequests = true;

  urlForUpdateRecord(id, modelName, snapshot) {
    if (snapshot.adapterOptions?.switchGenealogy) {
      return `${this.buildURL(modelName, id)}/switch-genealogy`;
    }
    return this.buildURL(modelName, id);
  }
}

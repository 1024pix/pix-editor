import Service, { inject as service } from '@ember/service';
import fetch from 'fetch';

export default class PhraseService extends Service {
  @service session;

  async download(fetchFn = fetch) {
    await fetchFn('/api/phrase/download', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.session.data.authenticated.apiKey}`,
      },
    });
  }
}

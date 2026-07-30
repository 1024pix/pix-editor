import Service, { service } from '@ember/service';

export default class PhraseService extends Service {
  @service session;

  async download(fetchFn = fetch) {
    await fetchFn('/api/phrase/download', {
      method: 'POST',
      headers: { ['x-api-key']: this.session.data.authenticated.apiKey },
    });
  }
}

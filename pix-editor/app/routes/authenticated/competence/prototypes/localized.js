import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class LocalizedPrototypeRoute extends Route {
  @service store;

  async model({ localized_challenge_id }) {
    const localizedChallenge = await this.store.findRecord('localized_challenge', localized_challenge_id);
    const challenge = await localizedChallenge.challenge;
    return { localizedChallenge, challenge };
  }

  async afterModel(model) {
    await model.localizedChallenge.files;
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    const localizedChallenge = model.localizedChallenge;
    controller.urlsToConsult = localizedChallenge.urlsToConsult?.join('\n') ?? '';
    controller.invalidUrlsToConsult = '';
  }

  resetController(controller, _isExiting, _transition) {
    super.resetController(controller, _isExiting, _transition);
    if (controller.edition) controller.send('cancelEdit');
  }
}

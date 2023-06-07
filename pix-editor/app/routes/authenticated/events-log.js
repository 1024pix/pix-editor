import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class EventsLogRoute extends Route {

  @service paginatedQuery;

  model() {
    const pq = this.paginatedQuery;
    return pq.queryByStep('note', {
      filterByFormula: 'AND({Type d\'élément} = \'acquis\', Changelog = \'oui\')',
      sort: [{ field: 'Date', direction: 'desc' }]
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    const pq = this.paginatedQuery;
    controller.offset = pq.getLastOffset();
  }
}

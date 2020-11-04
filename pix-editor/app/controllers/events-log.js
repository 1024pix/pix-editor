import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class EventsLogController extends Controller {

  @service paginatedQuery;
  @tracked offset;

  get queryStatus() {
    return this.offset === false;
  }

  @action
  async queryMoreLogs() {
    const pq = this.paginatedQuery;
    const resultQuery =  await pq.queryByStep('note', {
      filterByFormula: 'AND({Type d\'élément} = \'acquis\', Changelog = \'oui\')',
      sort: [{ field: 'Date', direction: 'desc' }]
    },this.model, this.offset);
    this.offset = pq.getLastOffset();
    return resultQuery;
  }
}

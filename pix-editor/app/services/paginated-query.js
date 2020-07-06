import Service from '@ember/service';
import {inject as service} from '@ember/service';
import {A} from '@ember/array';

export default class PaginatedQueryService extends Service {
  @service store;

  query(model, parameters) {
    const store = this.store;
    function queryPage(model, parameters, current) {
      if (!current) {
        current = A();
      }
      return store.query(model, parameters)
        .then((result) => {
          current.pushObjects(result.toArray());
          if (result.meta && result.meta.offset) {
            parameters.offset = result.meta.offset;
            return queryPage(model, parameters, current);
          } else {
            return current;
          }
        });
    }
    return queryPage(model, parameters);
  }
}

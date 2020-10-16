import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class PaginatedQueryService extends Service {
  @service store;

  @tracked offset = null;

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

  queryByStep(model, parameters, currentModel, offset) {
    const store = this.store;
    if (offset === false) {
      return currentModel;
    }
    if (!currentModel) {
      currentModel = A();
    }
    if (offset !== undefined) {
      parameters.offset = offset;
    }
    return store.query(model, parameters)
      .then(result => {
        currentModel.pushObjects(result.toArray());
        if (result.meta && result.meta.offset) {
          this.offset = result.meta.offset;
        } else {
          this.offset = false;
        }
        return currentModel;
      });
  }

  getLastOffset() {
    return this.offset;
  }
}

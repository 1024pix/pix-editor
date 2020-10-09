import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class PaginatedQueryService extends Service {
  @service store;

  @tracked resultMetaOffset = {};
  @tracked currentResult = {};
  @tracked endResult = {};

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

  queryByStep(model,parameters,scope) {
    const store = this.store;
    if (this.endResult[scope]) {
      return;
    }
    if (!this.currentResult[scope]) {
      this.currentResult[scope] = A();
    }
    if (this.resultMetaOffset[scope]) {
      parameters.offset = this.resultMetaOffset[scope];
    }
    return store.query(model, parameters)
      .then(result=>{
        this.currentResult[scope].pushObjects(result.toArray());
        if (result.meta && result.meta.offset) {
          this.resultMetaOffset[scope] =  result.meta.offset;
        } else {
          this.endResult[scope] = true;
        }
        return this.currentResult[scope];
      });
  }
}

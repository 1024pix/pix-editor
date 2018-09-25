import Route from '@ember/routing/route';
import {inject as service} from "@ember/service";

export default Route.extend({
  paginatedQuery:service(),
  model() {
    return this.modelFor('application');
  }
});

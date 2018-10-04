import ApplicationAdapter from './application';
import { inject as service } from '@ember/service';
import {computed} from "@ember/object";

export default ApplicationAdapter.extend({
  config:service(),
  namespace:computed("config.airtableWorkbenchBase", function() {
    // API Version + Base ID
    return "v0/"+this.get("config").get("airtableWorkbenchBase");
  }),
  pathForType() {
    return "Acquis";
  }/*,
  findMany (store, type, ids, snapshots) {
    let recordsText = 'OR(' + ids.map(id => `{Acquis prod} = '${id}'`).join(",") + ')';
    let url = this.buildURL(type.modelName, ids, snapshots, 'findMany');
    return this.ajax(url, 'GET', { data: { filterByFormula: recordsText } });
  }*/


});

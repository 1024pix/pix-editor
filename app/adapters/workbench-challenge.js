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
    return "Epreuves";
  }
});

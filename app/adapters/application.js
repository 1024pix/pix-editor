import AirtableAdapter from "ember-airtable/adapter";
import { inject as service } from '@ember/service';
import {computed} from "@ember/object";

export default AirtableAdapter.extend({
  config:service(),
  headers:computed("config.airtableKey", function() {
    return {
      Accept: 'application/json',
      // API Token
      Authorization: 'Bearer '+this.get("config").get("airtableKey")
    }
  }),
  namespace:computed("config.airtableBase", function() {
  // API Version + Base ID
  return "v0/"+this.get("config").get("airtableBase");
  }),
  pathForType(type) {
    switch (type) {
      case "skill":
        return "Acquis";
      case "tutorial":
        return "Tutoriels";
      case "tube":
        return "Tubes";
      default:
        return this._super(type);
    }
  },

  // from RESTAdpater, overriden to use PATCH instead of PUT
  updateRecord(store, type, snapshot) {
    let data = {};
    let serializer = store.serializerFor(type.modelName);

    serializer.serializeIntoHash(data, type, snapshot);

    let id = snapshot.id;
    let url = this.buildURL(type.modelName, id, snapshot, 'updateRecord');

    return this.ajax(url, "PATCH", { data: data });
  }
});

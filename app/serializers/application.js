import AirtableSerializer from "ember-airtable/serializer";

export default AirtableSerializer.extend({
  payloadKeyFromModelName: function(modelName) {
    if (modelName === 'area') {
      return 'Domaines';
    }
    return this._super(modelName);
  },
  serializeHasMany(snapshot, json, relationship) {
    if (relationship.options && relationship.options.readOnly) {
      return;
    }
    return this._super(snapshot, json, relationship);
  },

  serializeBelongsTo(snapshot, json, relationship) {
    if (relationship.options && relationship.options.readOnly) {
      return;
    }
    return this._super(snapshot, json, relationship);
  }
});
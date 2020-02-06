import DS from 'ember-data';
import { assign } from '@ember/polyfills';
import { pluralize } from 'ember-inflector';

export default DS.RESTSerializer.extend({
  payloadKeyFromModelName: function(modelName) {
    if (modelName === 'area') {
      return 'Domaines';
    }
    return this._super(modelName);
  },

  normalizeResponse(store, type, payload) {
    const modelNamePlural = pluralize(type.modelName);

    if(payload.records) {
      payload[modelNamePlural] = payload.records;
      delete payload.records;

      payload.meta = {
        offset: payload.offset
      };
      delete payload.offset;

      payload[modelNamePlural].forEach((record) => {
        assign(record, record.fields);
        delete record.fields;
        record.created = record.createdTime;
        delete record.createdTime;
      });
    } else {
      payload[type.modelName] = payload.fields;
      payload[type.modelName].id = payload.id;
      payload[type.modelName].created = payload.createdTime;
      delete payload.id;
      delete payload.fields;
      delete payload.createdTime;
    }

    return this._super(...arguments);
  },

  serializeIntoHash(data, type, record, options) {
    data['fields'] = this.serialize(record, options);
  },

  serialize(snapshot, options) {
    let json = this._super(snapshot, options);

    delete json.created;

    return json;
  },

  serializeAttribute(snapshot, json, key, attribute) {
    if (attribute.options && attribute.options.readOnly) {
      return;
    }
    this._super(...arguments);
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
    let key = relationship.key;
    let belongsToId = snapshot.belongsTo(key, { id: true });

    // if provided, use the mapping provided by `attrs` in
    // the serializer
    let payloadKey = this._getMappedKey(key, snapshot.type);
    if (payloadKey === key && this.keyForRelationship) {
      payloadKey = this.keyForRelationship(key, 'belongsTo', 'serialize');
    }

    json[payloadKey] = [belongsToId];
  }

});
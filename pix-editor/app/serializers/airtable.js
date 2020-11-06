import RESTSerializer from '@ember-data/serializer/rest';
import { assign } from '@ember/polyfills';
import { pluralize } from 'ember-inflector';

export default class AirtableSerializer extends RESTSerializer {

  payloadKeyFromModelName(modelName) {
    return super.payloadKeyFromModelName(modelName);
  }

  normalizeResponse(store, type, payload) {
    const modelNamePlural = pluralize(type.modelName);

    if (payload.records) {
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
      payload[type.modelName].created = payload.createdTime;
      delete payload.id;
      delete payload.fields;
      delete payload.createdTime;
    }

    return super.normalizeResponse(...arguments);
  }

  serializeIntoHash(data, type, record, options) {
    data['fields'] = this.serialize(record, options);
  }

  serialize(snapshot, options) {
    const json = super.serialize(snapshot, options);

    delete json.created;

    return json;
  }

  serializeAttribute(snapshot, json, key, attribute) {
    if (attribute.options && attribute.options.readOnly) {
      return;
    }
    return super.serializeAttribute(...arguments);
  }

  serializeHasMany(snapshot, json, relationship) {
    if (relationship.options && relationship.options.readOnly) {
      return;
    }
    return super.serializeHasMany(snapshot, json, relationship);
  }

  serializeBelongsTo(snapshot, json, relationship) {
    if (relationship.options && relationship.options.readOnly) {
      return;
    }
    const key = relationship.key;
    const belongsToId = snapshot.belongsTo(key, { id: true });

    // if provided, use the mapping provided by `attrs` in
    // the serializer
    let payloadKey = this._getMappedKey(key, snapshot.type);
    if (payloadKey === key && this.keyForRelationship) {
      payloadKey = this.keyForRelationship(key, 'belongsTo', 'serialize');
    }

    json[payloadKey] = [belongsToId];
  }

}

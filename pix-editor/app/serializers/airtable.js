import RESTSerializer from '@ember-data/serializer/rest';
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
        Object.assign(record, record.fields);
        delete record.fields;
        record.created = record.createdTime;
        delete record.createdTime;
      });
    } else if (payload.fields) {
      payload[type.modelName] = payload.fields;
      payload[type.modelName].created = payload.createdTime;
      delete payload.id;
      delete payload.fields;
      delete payload.createdTime;
    } else if (payload.deleted) {
      payload[type.modelName] = {};
      delete payload.id;
      delete payload.deleted;
    }

    return super.normalizeResponse(...arguments);
  }

  serializeIntoHash(data, type, record, options) {
    data['fields'] = this.serialize(record, options);
  }

  serialize(snapshot, options) {
    const json = super.serialize(snapshot, options);

    delete json.created;
    delete json[this.airtableId];

    return json;
  }

  serializeAttribute(snapshot, json, key, attribute) {
    if (attribute.options && attribute.options.readOnly) {
      return;
    }
    return super.serializeAttribute(...arguments);
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

  serializeHasMany(snapshot, json, relationship) {
    if (relationship.options && relationship.options.readOnly) {
      return;
    }

    const key = relationship.key;

    if (this.shouldSerializeHasMany(snapshot, key, relationship)) {

      const hasMany = snapshot.hasMany(key);

      if (hasMany !== undefined) {
        // if provided, use the mapping provided by `attrs` in
        // the serializer
        let payloadKey = this._getMappedKey(key, snapshot.type);
        if (payloadKey === key && this.keyForRelationship) {
          payloadKey = this.keyForRelationship(key, 'hasMany', 'serialize');
        }

        json[payloadKey] = hasMany.map((model) => {
          if (model.attributes().airtableId)
            return model.attributes().airtableId;
          return model.id;
        });
      }
    }
  }
}

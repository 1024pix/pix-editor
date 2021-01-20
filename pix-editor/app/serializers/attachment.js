import AirtableSerializer from './airtable';

export default class AttachmentSerializer extends AirtableSerializer {
  primaryKey = 'Record ID';

  attrs = {
    filename: 'filename',
    url: 'url',
    mimeType: 'mimeType',
    size: 'size',
    type: 'type',
  };

  payloadKeyFromModelName() {
    return 'Attachments';
  }

  serializeBelongsTo(snapshot, json, relationship) {
    const payloadKey = 'challengeId';

    const key = relationship.key;
    json[payloadKey] = [snapshot.belongsTo(key, { id: true })];

  }
}

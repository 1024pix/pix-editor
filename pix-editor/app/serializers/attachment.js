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
    if (relationship.key !== 'challenge') return;

    const challenge = snapshot.belongsTo('challenge');
    const { airtableId } = challenge.attributes();

    json.challengeId = [airtableId];
    json.localizedChallengeId = challenge.id;
  }
}

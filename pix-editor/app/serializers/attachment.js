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

    const challengeId = snapshot.belongsTo('challenge').attributes().airtableId;

    json.challengeId = [challengeId];
    json.localizedChallengeId = challengeId;
  }
}

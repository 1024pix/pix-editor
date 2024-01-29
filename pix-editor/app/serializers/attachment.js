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

  serializeBelongsTo(snapshot, json) {
    const challenge = snapshot.belongsTo('challenge');
    const localizedChallenge = snapshot.belongsTo('localizedChallenge');
    const { airtableId } = challenge.attributes();

    json.challengeId = [airtableId];
    json.localizedChallengeId = localizedChallenge?.id ? localizedChallenge.id : challenge.id;
  }
}

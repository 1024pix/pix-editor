import AirtableSerializer from './airtable';

export default class AttachmentSerializer extends AirtableSerializer {
  primaryKey = 'Record ID';

  attrs = {
    filename: 'filename',
    url: 'url',
    mimeType: 'mimeType',
    size: 'size',
    type: 'type',
    localizedChallenge: 'localizedChallengeId',
  };

  payloadKeyFromModelName() {
    return 'Attachments';
  }

  serializeBelongsTo(snapshot, json, relationship) {
    if (relationship.key === 'localizedChallenge') {
      const localizedChallenge = snapshot.belongsTo('localizedChallenge');
      if (localizedChallenge) {
        json.localizedChallengeId = localizedChallenge.id;
      }
    }

    if (relationship.key === 'challenge') {
      const challenge = snapshot.belongsTo('challenge');
      if (!challenge) return;

      json.challengeId = [challenge.attributes().airtableId];
      if (!json.localizedChallengeId) {
        json.localizedChallengeId = challenge.id;
      }

    }
  }
}

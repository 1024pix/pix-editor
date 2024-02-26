import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Serializer | attachment', function (hooks) {
  setupTest(hooks);

  test('it serializes attachments', function (assert) {
    const store = this.owner.lookup('service:store');
    const challenge = store.createRecord('challenge', { id: 'challengeId', airtableId: 'myAirtableId' });
    const attachment = store.createRecord('attachment', {
      filename: 'filename',
      url: 'url',
      mimeType: 'mimeType',
      size: 'size',
      type: 'type',
      challenge,
    });

    const expectedSerializedAttachment = {
      filename: 'filename',
      url: 'url',
      mimeType: 'mimeType',
      size: 'size',
      type: 'type',
      challengeId: ['myAirtableId'],
      localizedChallengeId: 'challengeId'
    };

    const serializedAttachment = attachment.serialize();

    assert.deepEqual(serializedAttachment, expectedSerializedAttachment);
  });
});

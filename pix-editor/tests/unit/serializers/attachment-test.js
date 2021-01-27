import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Serializer | attachment', function(hooks) {
  setupTest(hooks);

  test('it serializes attachments', function(assert) {
    const store = this.owner.lookup('service:store');
    const challenge = run(() => store.createRecord('challenge', { id: 'challengeId' }));
    const attachment = run(() => store.createRecord('attachment', {
      filename: 'filename',
      url: 'url',
      mimeType: 'mimeType',
      size: 'size',
      type: 'type',
      challenge
    }));

    const expectedSerializedAttachment = {
      filename: 'filename',
      url: 'url',
      mimeType: 'mimeType',
      size: 'size',
      type: 'type',
      challengeId: ['challengeId'],
    };

    const serializedAttachment = attachment.serialize();

    assert.deepEqual(serializedAttachment, expectedSerializedAttachment);
  });
});

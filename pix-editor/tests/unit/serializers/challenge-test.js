import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Serializer | challenge', function(hooks) {
  setupTest(hooks);

  test('it serializes the challenge with the airtable id as id', function(assert) {
    const store = this.owner.lookup('service:store');
    const record = run(() => store.createRecord('challenge', { id: 'my id persistant', airtableId: 'my record id' }));

    const serializer = store.serializerFor('challenge');
    const serializedRecord = {};
    serializer.serializeIntoHash(serializedRecord, store.modelFor('challenge'), record._createSnapshot(), { includeId: true });
    const expectedSerialization = {
      fields: {
        'id persistant': 'my id persistant',
        'Auteur': undefined,
        'Bonnes réponses': undefined,
        'Bonnes réponses à afficher': undefined,
        'Consigne': undefined,
        'Consigne alternative': undefined,
        'Daltonien': undefined,
        'Déclinable': undefined,
        'Embed URL': undefined,
        'Embed height': null,
        'Embed title': undefined,
        'Format': undefined,
        'Généalogie': undefined,
        'Géographie': undefined,
        'Illustration de la consigne': undefined,
        'Langues': undefined,
        'Non voyant': undefined,
        'Pièce jointe': undefined,
        'Propositions': undefined,
        'Responsive': undefined,
        'Réponse automatique': undefined,
        'Scoring': undefined,
        'Spoil': undefined,
        'Statut': undefined,
        'T1 - Espaces, casse & accents': 'Désactivé',
        'T2 - Ponctuation': 'Désactivé',
        'T3 - Distance d\'édition': 'Désactivé',
        'Texte alternatif illustration': undefined,
        'Timer': null,
        'Type d\'épreuve': undefined,
        'Type péda': undefined,
        'Version déclinaison': null,
        'Version prototype': null,
      },
    };

    assert.deepEqual(serializedRecord, expectedSerialization);
  });
});

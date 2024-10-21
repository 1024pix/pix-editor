import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Model | challenge', function(hooks) {
  setupTest(hooks);
  let store, idGeneratorStub, alternative, prototype;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');

    class ConfigService extends Service {
      constructor() {
        super(...arguments);
        this.author = 'NEW';
      }
    }
    this.owner.unregister('service:config');
    this.owner.register('service:config', ConfigService);

    idGeneratorStub = { newId: sinon.stub().returns('generatedId') };
    prototype = {
      id: 'pix_1',
      airtableId: 'rec_1',
      instruction: 'proto instruction',
      alternativeInstruction: 'proto alternativeInstruction',
      type: 'proto type',
      format: 'proto format',
      proposals: 'proto proposals',
      solution: 'proto solution',
      solutionToDisplay: 'proto solutionToDisplay',
      t1Status: 'proto t1Status',
      t2Status: 'proto t2Status',
      t3Status: 'proto t3Status',
      pedagogy: 'proto pedagogy',
      declinable: 'proto declinable',
      preview: 'proto preview',
      timer: 123,
      embedURL: 'proto embedURL',
      embedTitle: 'proto embedTitle',
      embedHeight: 500,
      alternativeVersion: 5,
      accessibility1: 'proto accessibility1',
      accessibility2: 'proto accessibility2',
      spoil: 'proto spoil',
      responsive: 'proto responsive',
      locales: ['fr'],
      alternativeLocales: ['fr'],
      geography: 'proto geography',
      urlsToConsult: ['some', 'url'],
      autoReply: 'proto autoReply',
      focusable: 'proto focusable',
      illustrationAlt: 'proto illustrationAlt',
      updatedAt: new Date('2020-01-01'),
      validatedAt: new Date('2020-01-01'),
      archivedAt: new Date('2020-01-01'),
      madeObsoleteAt: new Date('2020-01-01'),
      shuffled: true,
      contextualizedFields: ['oui', 'non'],
      status: 'validé',
      genealogy: 'Prototype 1',
      author: 'DEV',
      version: 1,
      skill: store.createRecord('skill', {}),
      idGenerator: idGeneratorStub,
      requireGafamWebsiteAccess: true,
      isIncompatibleIpadCertif: true,
      deafAndHardOfHearing: 'OK',
      isAwarenessChallenge: true,
      toRephrase: true,
    };
    alternative = {
      id: 'pix_1',
      airtableId: 'rec_1',
      status: 'validé',
      author: 'DEV',
      alternativeVersion: 1,
      skill: store.createRecord('skill', {}),
      idGenerator: idGeneratorStub,
      instruction: 'alternative instruction',
      alternativeInstruction: 'alternative alternativeInstruction',
      type: 'alternative type',
      format: 'alternative format',
      proposals: 'alternative proposals',
      solution: 'alternative solution',
      solutionToDisplay: 'alternative solutionToDisplay',
      t1Status: 'alternative t1Status',
      t2Status: 'alternative t2Status',
      t3Status: 'alternative t3Status',
      pedagogy: 'alternative pedagogy',
      declinable: 'alternative declinable',
      preview: 'alternative preview',
      timer: 123,
      embedURL: 'alternative embedURL',
      embedTitle: 'alternative embedTitle',
      embedHeight: 500,
      accessibility1: 'alternative accessibility1',
      accessibility2: 'alternative accessibility2',
      spoil: 'alternative spoil',
      responsive: 'alternative responsive',
      locales: ['fr'],
      alternativeLocales: ['fr'],
      geography: 'alternative geography',
      urlsToConsult: ['some', 'url'],
      autoReply: 'alternative autoReply',
      focusable: 'alternative focusable',
      illustrationAlt: 'alternative illustrationAlt',
      updatedAt: new Date('2020-01-01'),
      validatedAt: new Date('2020-01-01'),
      archivedAt: new Date('2020-01-01'),
      madeObsoleteAt: new Date('2020-01-01'),
      shuffled: true,
      contextualizedFields: ['oui', 'non'],
      genealogy: 'Décliné 1',
      version: 1,
      requireGafamWebsiteAccess: true,
      isIncompatibleIpadCertif: true,
      deafAndHardOfHearing: 'OK',
      isAwarenessChallenge: true,
      toRephrase: true,
    };
  });

  module('#duplicate', function() {
    test('it should duplicate challenge to create new prototype version', async function(assert) {
      // given
      const challenge = store.createRecord('challenge', prototype);

      // when
      const clonedChallenge = await challenge.duplicate();

      // then
      assert.strictEqual(clonedChallenge.constructor.modelName, 'challenge', 'check modèle challenge');
      assert.strictEqual(clonedChallenge.id, 'generatedId', 'champ id');
      assert.strictEqual(clonedChallenge.airtableId, undefined, 'champ airtableId');
      assert.strictEqual(clonedChallenge.instruction, prototype.instruction, 'champ instruction');
      assert.strictEqual(clonedChallenge.alternativeInstruction, prototype.alternativeInstruction, 'champ alternativeInstruction');
      assert.strictEqual(clonedChallenge.type, prototype.type, 'champ type');
      assert.strictEqual(clonedChallenge.format, prototype.format, 'champ format');
      assert.strictEqual(clonedChallenge.proposals, prototype.proposals, 'champ proposals');
      assert.strictEqual(clonedChallenge.solution, prototype.solution, 'champ solution');
      assert.strictEqual(clonedChallenge.solutionToDisplay, prototype.solutionToDisplay, 'champ solutionToDisplay');
      assert.strictEqual(clonedChallenge.t1Status, prototype.t1Status, 'champ t1Status');
      assert.strictEqual(clonedChallenge.t2Status, prototype.t2Status, 'champ t2Status');
      assert.strictEqual(clonedChallenge.t3Status, prototype.t3Status, 'champ t3Status');
      assert.strictEqual(clonedChallenge.pedagogy, prototype.pedagogy, 'champ pedagogy');
      assert.strictEqual(clonedChallenge.declinable, prototype.declinable, 'champ declinable');
      assert.strictEqual(clonedChallenge.preview, prototype.preview, 'champ preview');
      assert.strictEqual(clonedChallenge.timer, prototype.timer, 'champ timer');
      assert.strictEqual(clonedChallenge.embedURL, prototype.embedURL, 'champ embedURL');
      assert.strictEqual(clonedChallenge.embedTitle, prototype.embedTitle, 'champ embedTitle');
      assert.strictEqual(clonedChallenge.embedHeight, prototype.embedHeight, 'champ embedHeight');
      assert.strictEqual(clonedChallenge.alternativeVersion, prototype.alternativeVersion, 'champ alternativeVersion');
      assert.strictEqual(clonedChallenge.accessibility1, prototype.accessibility1, 'champ accessibility1');
      assert.strictEqual(clonedChallenge.accessibility2, prototype.accessibility2, 'champ accessibility2');
      assert.strictEqual(clonedChallenge.spoil, prototype.spoil, 'champ spoil');
      assert.strictEqual(clonedChallenge.responsive, prototype.responsive, 'champ responsive');
      assert.deepEqual(clonedChallenge.locales, prototype.locales, 'champ locales');
      assert.deepEqual(clonedChallenge.alternativeLocales, prototype.alternativeLocales, 'champ alternativeLocales');
      assert.strictEqual(clonedChallenge.geography, prototype.geography, 'champ geography');
      assert.deepEqual(clonedChallenge.urlsToConsult, prototype.urlsToConsult, 'champ urlsToConsult');
      assert.strictEqual(clonedChallenge.autoReply, prototype.autoReply, 'champ autoReply');
      assert.strictEqual(clonedChallenge.focusable, prototype.focusable, 'champ focusable');
      assert.strictEqual(clonedChallenge.illustrationAlt, prototype.illustrationAlt, 'champ illustrationAlt');
      assert.strictEqual(clonedChallenge.updatedAt, undefined, 'champ updatedAt');
      assert.strictEqual(clonedChallenge.validatedAt, undefined, 'champ validatedAt');
      assert.strictEqual(clonedChallenge.archivedAt, undefined, 'champ archivedAt');
      assert.strictEqual(clonedChallenge.madeObsoleteAt, undefined, 'champ madeObsoleteAt');
      assert.strictEqual(clonedChallenge.shuffled, prototype.shuffled, 'champ shuffled');
      assert.deepEqual(clonedChallenge.contextualizedFields, prototype.contextualizedFields, 'champ contextualizedFields');
      assert.strictEqual(clonedChallenge.status, 'proposé', 'champ status');
      assert.strictEqual(clonedChallenge.genealogy, prototype.genealogy, 'champ genealogy');
      assert.deepEqual(clonedChallenge.author, ['NEW'], 'champ author');
      assert.strictEqual(clonedChallenge.version, undefined, 'champ version');
      assert.ok(clonedChallenge.skill, 'champ skill');
      assert.strictEqual(clonedChallenge.requireGafamWebsiteAccess, prototype.requireGafamWebsiteAccess, 'champ requireGafamWebsiteAccess');
      assert.strictEqual(clonedChallenge.isIncompatibleIpadCertif, prototype.isIncompatibleIpadCertif, 'champ isIncompatibleIpadCertif');
      assert.strictEqual(clonedChallenge.deafAndHardOfHearing, prototype.deafAndHardOfHearing, 'champ deafAndHardOfHearing');
      assert.strictEqual(clonedChallenge.isAwarenessChallenge, prototype.isAwarenessChallenge, 'champ isAwarenessChallenge');
      assert.strictEqual(clonedChallenge.toRephrase, prototype.toRephrase, 'champ toRephrase');
    });

    test('it should duplicate challenge to create new alternative version', async function(assert) {
      // given
      const challenge = store.createRecord('challenge', alternative);

      // when
      const clonedChallenge = await challenge.duplicate();

      // then
      assert.strictEqual(clonedChallenge.constructor.modelName, 'challenge', 'check modèle challenge');
      assert.strictEqual(clonedChallenge.id, 'generatedId', 'champ id');
      assert.strictEqual(clonedChallenge.airtableId, undefined, 'champ airtableId');
      assert.strictEqual(clonedChallenge.instruction, alternative.instruction, 'champ instruction');
      assert.strictEqual(clonedChallenge.alternativeInstruction, alternative.alternativeInstruction, 'champ alternativeInstruction');
      assert.strictEqual(clonedChallenge.type, alternative.type, 'champ type');
      assert.strictEqual(clonedChallenge.format, alternative.format, 'champ format');
      assert.strictEqual(clonedChallenge.proposals, alternative.proposals, 'champ proposals');
      assert.strictEqual(clonedChallenge.solution, alternative.solution, 'champ solution');
      assert.strictEqual(clonedChallenge.solutionToDisplay, alternative.solutionToDisplay, 'champ solutionToDisplay');
      assert.strictEqual(clonedChallenge.t1Status, alternative.t1Status, 'champ t1Status');
      assert.strictEqual(clonedChallenge.t2Status, alternative.t2Status, 'champ t2Status');
      assert.strictEqual(clonedChallenge.t3Status, alternative.t3Status, 'champ t3Status');
      assert.strictEqual(clonedChallenge.pedagogy, alternative.pedagogy, 'champ pedagogy');
      assert.strictEqual(clonedChallenge.declinable, alternative.declinable, 'champ declinable');
      assert.strictEqual(clonedChallenge.preview, alternative.preview, 'champ preview');
      assert.strictEqual(clonedChallenge.timer, alternative.timer, 'champ timer');
      assert.strictEqual(clonedChallenge.embedURL, alternative.embedURL, 'champ embedURL');
      assert.strictEqual(clonedChallenge.embedTitle, alternative.embedTitle, 'champ embedTitle');
      assert.strictEqual(clonedChallenge.embedHeight, alternative.embedHeight, 'champ embedHeight');
      assert.strictEqual(clonedChallenge.alternativeVersion, undefined, 'champ alternativeVersion');
      assert.strictEqual(clonedChallenge.accessibility1, alternative.accessibility1, 'champ accessibility1');
      assert.strictEqual(clonedChallenge.accessibility2, alternative.accessibility2, 'champ accessibility2');
      assert.strictEqual(clonedChallenge.spoil, alternative.spoil, 'champ spoil');
      assert.strictEqual(clonedChallenge.responsive, alternative.responsive, 'champ responsive');
      assert.deepEqual(clonedChallenge.locales, alternative.locales, 'champ locales');
      assert.deepEqual(clonedChallenge.alternativeLocales, alternative.alternativeLocales, 'champ alternativeLocales');
      assert.strictEqual(clonedChallenge.geography, alternative.geography, 'champ geography');
      assert.deepEqual(clonedChallenge.urlsToConsult, alternative.urlsToConsult, 'champ urlsToConsult');
      assert.strictEqual(clonedChallenge.autoReply, alternative.autoReply, 'champ autoReply');
      assert.strictEqual(clonedChallenge.focusable, alternative.focusable, 'champ focusable');
      assert.strictEqual(clonedChallenge.illustrationAlt, alternative.illustrationAlt, 'champ illustrationAlt');
      assert.strictEqual(clonedChallenge.updatedAt, undefined, 'champ updatedAt');
      assert.strictEqual(clonedChallenge.validatedAt, undefined, 'champ validatedAt');
      assert.strictEqual(clonedChallenge.archivedAt, undefined, 'champ archivedAt');
      assert.strictEqual(clonedChallenge.madeObsoleteAt, undefined, 'champ madeObsoleteAt');
      assert.strictEqual(clonedChallenge.shuffled, alternative.shuffled, 'champ shuffled');
      assert.deepEqual(clonedChallenge.contextualizedFields, alternative.contextualizedFields, 'champ contextualizedFields');
      assert.strictEqual(clonedChallenge.status, 'proposé', 'champ status');
      assert.strictEqual(clonedChallenge.genealogy, alternative.genealogy, 'champ genealogy');
      assert.deepEqual(clonedChallenge.author, ['NEW'], 'champ author');
      assert.strictEqual(clonedChallenge.version, alternative.version, 'champ version');
      assert.ok(clonedChallenge.skill, 'champ skill');
      assert.strictEqual(clonedChallenge.requireGafamWebsiteAccess, alternative.requireGafamWebsiteAccess, 'champ requireGafamWebsiteAccess');
      assert.strictEqual(clonedChallenge.isIncompatibleIpadCertif, alternative.isIncompatibleIpadCertif, 'champ isIncompatibleIpadCertif');
      assert.strictEqual(clonedChallenge.deafAndHardOfHearing, alternative.deafAndHardOfHearing, 'champ deafAndHardOfHearing');
      assert.strictEqual(clonedChallenge.isAwarenessChallenge, alternative.isAwarenessChallenge, 'champ isAwarenessChallenge');
      assert.strictEqual(clonedChallenge.toRephrase, alternative.toRephrase, 'champ toRephrase');
    });

    test('it should clone the attachments', async function(assert) {
      // given
      const challenge = store.createRecord('challenge', prototype);
      const illustration = store.createRecord('attachment', { id: 'rec1234156', filename: 'filename.test', url: 'data:;', size: 10, mimeType: 'image/png', type: 'illustration', alt: 'alt message', challenge });

      // when
      const clonedChallenge = await challenge.duplicate();
      const clonedFiles = await clonedChallenge.files;

      // then
      assert.strictEqual(clonedChallenge.files.length, 1);
      assert.strictEqual(illustration.url, clonedFiles[0].url);
      assert.notEqual(illustration.id, clonedFiles[0].id);
      assert.ok(clonedFiles[0].cloneBeforeSave);
    });
  });

  module('#copyForDifferentSkill', function() {
    test('it should create a copy of the challenge for a different skill', async function(assert) {
      // given
      const challenge = store.createRecord('challenge', prototype);

      // when
      const clonedChallenge = await challenge.copyForDifferentSkill();
      const skill = await clonedChallenge.skill;

      // then
      assert.strictEqual(clonedChallenge.constructor.modelName, 'challenge');
      assert.strictEqual(clonedChallenge.id, 'generatedId');
      assert.strictEqual(clonedChallenge.airtableId, undefined);
      assert.strictEqual(clonedChallenge.status, 'proposé');
      assert.notOk(skill);
    });

    test('it should clone the attachments', async function(assert) {
      // given
      const challenge = store.createRecord('challenge', prototype);
      const illustration = store.createRecord('attachment', { id: 'rec1234156', filename: 'filename.test', url: 'data:;', size: 10, mimeType: 'image/png', type: 'illustration', alt: 'alt message', challenge });

      // when
      const clonedChallenge = await challenge.copyForDifferentSkill();
      const clonedFiles = await clonedChallenge.files;

      // then
      assert.strictEqual(clonedFiles.length, 1);
      assert.strictEqual(illustration.url, clonedFiles[0].url);
      assert.notEqual(illustration.id, clonedFiles[0].id);
      assert.ok(clonedFiles[0].cloneBeforeSave);
    });
  });

  module('#baseNameUpdated', function() {
    test('it should return true if the base name is updated', function(assert) {
      // given
      const challenge = store.createRecord('challenge', prototype);
      store.createRecord('attachment', { id: 'rec1234156', filename: 'filename.test', url: 'data:;', size: 10, mimeType: 'image/png', type: 'attachment', challenge });

      // when
      challenge.attachmentBaseName = 'otherName';

      // then
      assert.true(challenge.baseNameUpdated());
    });

    test('it should return false if the base name is not updated', function(assert) {
      // given
      const challenge = store.createRecord('challenge', prototype);
      store.createRecord('attachment', { id: 'rec1234156', filename: 'filename.test', url: 'data:;', size: 10, mimeType: 'image/png', type: 'attachment', challenge });

      // when
      challenge.attachmentBaseName = 'filename';

      // then
      assert.false(challenge.baseNameUpdated());
    });

    test('it should return true if the base name undefined', function(assert) {
      // given
      const challenge = store.createRecord('challenge', prototype);
      store.createRecord('attachment', { id: 'rec1234156', filename: 'filename.test', url: 'data:;', size: 10, mimeType: 'image/png', type: 'attachment', challenge });

      // then
      assert.false(challenge.baseNameUpdated());
    });

  });

  module('#getNextAlternativeVersion', function() {
    test('it should return 1 if no other alternatives', function(assert) {
      // given
      const proto = store.createRecord('challenge', {
        id: 'challengeProto',
        genealogy: 'Prototype 1',
        skill: store.createRecord('skill', {}),
      });

      // when
      const nextAlternativeVersion = proto.getNextAlternativeVersion();

      // then
      assert.strictEqual(nextAlternativeVersion, 1);
    });

    test('it should return "highest current decli + 1" when there are alternatives', function(assert) {
      // given
      const skill = store.createRecord('skill', {});
      const proto = store.createRecord('challenge', {
        id: 'challengeProto',
        genealogy: 'Prototype 1',
        skill,
      });
      store.createRecord('challenge', {
        id: 'challengeDécli1',
        genealogy: 'Décliné 1',
        alternativeVersion: 1,
        skill,
      });
      store.createRecord('challenge', {
        id: 'challengeDécli3',
        genealogy: 'Décliné 1',
        alternativeVersion: 3,
        skill,
      });
      store.createRecord('challenge', {
        id: 'challengeDécli4String',
        genealogy: 'Décliné 1',
        alternativeVersion: '4',
        skill,
      });
      store.createRecord('challenge', {
        id: 'challengeDécliNull',
        genealogy: 'Décliné 1',
        alternativeVersion: null,
        skill,
      });
      store.createRecord('challenge', {
        id: 'challengeDécliHello',
        genealogy: 'Décliné 1',
        alternativeVersion: 'hello',
        skill,
      });
      store.createRecord('challenge', {
        id: 'challengeDécliMinusOne',
        genealogy: 'Décliné 1',
        alternativeVersion: -1,
        skill,
      });

      // when
      const nextAlternativeVersion = proto.getNextAlternativeVersion();

      // then
      assert.strictEqual(nextAlternativeVersion, 5);
    });
  });
});

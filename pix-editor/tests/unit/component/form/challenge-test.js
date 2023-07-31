import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import sinon from 'sinon';

module('unit | Component | form/challenge', function(hooks) {
  setupTest(hooks);
  let component;

  hooks.beforeEach(function() {
    component = createGlimmerComponent('component:form/challenge');
  });

  test('it should add illustration', function(assert) {
    // given
    const createRecordStub = sinon.stub();
    component.store = {
      createRecord: createRecordStub,
    };

    const file =  {
      name: 'file_name',
      size: 123,
      type: 'image/png',
    };

    const challenge = {
      id: 'recchallenge_1',
      name: 'challenge'
    };

    component.args.challenge = challenge;

    const expectedAttachment = {
      filename: 'file_name',
      size: 123,
      mimeType: 'image/png',
      file,
      type: 'illustration',
      challenge,
      alt: 'alternative text',
    };

    // when
    component.addIllustration(file, 'alternative text');

    // then
    assert.ok(createRecordStub.calledWith('attachment', expectedAttachment));
  });

  test('it should remove illustration', async function(assert) {
    // given
    const deleteRecordStub = sinon.stub();
    const challenge = {
      id: 'recchallenge_1',
      name: 'challenge',
      files: [],
      illustration: {
        filename: 'file_name',
        size: 123,
        mimeType: 'image/png',
        type: 'illustration',
        deleteRecord: deleteRecordStub,
        alt: 'alternative text',
      }
    };
    component.args.challenge = challenge;

    // when
    const alternativeText = await component.removeIllustration();

    // then
    assert.ok(deleteRecordStub.calledOnce);
    assert.strictEqual(alternativeText, 'alternative text');
  });

  test('it should add attachment', async function(assert) {
    //given
    const createRecordStub = sinon.stub();
    component.store = {
      createRecord: createRecordStub,
    };

    const file =  {
      name: 'file_name',
      size: 123,
      type: 'application/msdoc',
    };

    const challenge = {
      id: 'recchallenge_1',
      name: 'challenge'
    };

    component.args.challenge = challenge;

    const expectedAttachment = {
      filename: 'file_name',
      size: 123,
      mimeType: 'application/msdoc',
      file,
      type: 'attachment',
      challenge,
    };

    // when
    component.addAttachment(file);

    // then
    assert.ok(createRecordStub.calledWith('attachment', expectedAttachment));
  });

  test('it should set locales properly', async function(assert) {
    // given
    const input = [
      { label: 'Anglais', value: 'en' },
      { label: 'Franco Français', value: 'fr-fr' },
      { label: 'Francophone', value: 'fr' }
    ];

    const expected = ['en','fr-fr','fr'];

    const challenge = {
      id: 'recchallenge_1',
      name: 'challenge',
      locales: []
    };
    component.args.challenge = challenge;

    // when
    component.setLocales(input);

    // then
    assert.deepEqual(challenge.locales, expected);
  });
});

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
    assert.equal(alternativeText, 'alternative text');
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

  test('it should remove attachment', async function(assert) {
    // given
    const deleteRecordStub = sinon.stub();
    const deleteRecordStub2 = sinon.stub();

    const attachment = {
      filename: 'file_name.doc',
      size: 123,
      mimeType: 'application/msdoc',
      type: 'attachment',
      deleteRecord: deleteRecordStub,
    };

    const challenge = {
      id: 'recchallenge_1',
      name: 'challenge',
      files: [
        attachment,
        {
          filename: 'file_name2.doc',
          size: 123,
          mimeType: 'application/msdoc',
          type: 'attachment',
          deleteRecord: deleteRecordStub2,
        }
      ],
    };
    component.args.challenge = challenge;

    // when
    await component.removeAttachment(attachment);

    // then
    assert.ok(deleteRecordStub.calledOnce);
    assert.ok(deleteRecordStub2.notCalled);
  });
});

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Sinon from 'sinon';

module('Unit | Controller | competence/skills/single', function (hooks) {
  setupTest(hooks);

  let storeStub, controller;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:competence/skills/single');

    const note = { save: Sinon.stub().resolves() };
    storeStub = { createRecord: Sinon.stub().returns(note) };
    controller.store = storeStub;
  });

  test('it should create a skill changelogEntry', async function (assert) {
    //given
    const changelogValue = 'Acquis modifié';
    const skill = {
      pixId: 'rec123456',
      name: 'skillName',
    };

    const expectedChangelog = {
      author: Sinon.match.any,
      text: changelogValue,
      recordId: skill.pixId,
      createdAt: Sinon.match.any,
      elementType: 'acquis'
    };

    //when
    await controller._handleSkillChangelog(skill, changelogValue);

    //then
    Sinon.assert.calledWithMatch(storeStub.createRecord, 'changelogEntry', expectedChangelog);
    assert.expect(0);
  });

  test('it should create a challenge changelogEntry', async function (assert) {
    //given
    const changelogValue = 'Epreuve modifié';
    const challenge = {
      pixId: 'rec123456',
      name: 'challengeName',
    };

    const expectedChangelog = {
      author: Sinon.match.any,
      text: changelogValue,
      recordId: challenge.pixId,
      createdAt: Sinon.match.any,
      elementType: 'épreuve'
    };

    //when
    await controller._handleChallengeChangelog(challenge, changelogValue);

    //then
    Sinon.assert.calledWithMatch(storeStub.createRecord, 'changelogEntry', expectedChangelog);
    assert.expect(0);
  });
});

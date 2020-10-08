import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import Sinon from 'sinon';

module('Unit | Controller | competence/skills/single', function (hooks) {
  setupTest(hooks);

  let storeStub, controller, changelogEntry;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:competence/skills/single');
    changelogEntry = Service.extend({});
    this.owner.register('service:ChangelogEntry', changelogEntry);

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
      elementType: changelogEntry.skill
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
      elementType: changelogEntry.challenge
    };

    //when
    await controller._handleChallengeChangelog(challenge, changelogValue);

    //then
    Sinon.assert.calledWithMatch(storeStub.createRecord, 'changelogEntry', expectedChangelog);
    assert.expect(0);
  });
});

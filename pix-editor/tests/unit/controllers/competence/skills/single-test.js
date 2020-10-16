import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';

module('Unit | Controller | competence/skills/single', function (hooks) {
  setupTest(hooks);

  let storeStub, controller, changelogEntryService,configService;
  const date = '14/07/1986';
  const author = 'DEV';

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:competence/skills/single');
    changelogEntryService = this.owner.lookup('service:ChangelogEntry');
    configService = Service.extend({ author });
    this.owner.unregister('service:Config');
    this.owner.register('service:Config',configService);

    const note = { save: sinon.stub().resolves() };
    storeStub = { createRecord: sinon.stub().returns(note) };
    controller.store = storeStub;
  });

  test('it should create a skill changelogEntry', async function (assert) {
    //given
    const changelogValue = 'Acquis modifié';
    const skill = {
      pixId: 'rec123456',
      name: 'skillName',
    };
    const action = changelogEntryService.createAction;

    const expectedChangelog = {
      author,
      text: changelogValue,
      recordId: skill.pixId,
      skillName: skill.name,
      elementType: changelogEntryService.skill,
      createdAt: date,
      action
    };

    //when
    await controller._handleSkillChangelog(skill, changelogValue, action);

    //then
    const storeResult = storeStub.createRecord.getCall(0).args;
    //stub createdAt
    storeResult[1].createdAt = date;
    assert.deepEqual(storeStub.createRecord.getCall(0).args,['changelogEntry', expectedChangelog]);
  });

  test('it should create a challenge changelogEntry', async function (assert) {
    //given
    const changelogValue = 'Epreuve modifié';
    const challenge = {
      pixId: 'rec123456',
      name: 'challengeName',
    };

    const expectedChangelog = {
      author,
      text: changelogValue,
      recordId: challenge.pixId,
      createdAt: date,
      elementType: changelogEntryService.challenge,
    };

    //when
    await controller._handleChallengeChangelog(challenge, changelogValue);

    //then
    const storeResult = storeStub.createRecord.getCall(0).args;
    //stub createdAt
    storeResult[1].createdAt = date;
    assert.deepEqual(storeStub.createRecord.getCall(0).args,['changelogEntry', expectedChangelog]);
  });
});

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import sinon from 'sinon';


module('Unit | Controller | competence/skills/single', function (hooks) {
  setupTest(hooks);

  let storeStub, controller, changelogEntryService;
  const date = '14/07/1986';
  const author = 'DEV';

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:competence/skills/single');
    changelogEntryService = this.owner.lookup('service:ChangelogEntry');
    class ConfigService extends Service {
      constructor() {
        super(...arguments);
        this.author = author;
      }
      ask = sinon.stub().resolves()
    }
    this.owner.unregister('service:Config');
    this.owner.register('service:Config',ConfigService);
  });

  test('it should create a skill changelogEntry', async function (assert) {
    //given
    const note = { save: sinon.stub().resolves() };
    storeStub = { createRecord: sinon.stub().returns(note) };
    controller.store = storeStub;
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
    const note = { save: sinon.stub().resolves() };
    storeStub = { createRecord: sinon.stub().returns(note) };
    controller.store = storeStub;
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

  test('it should clone skill with new location', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');

    const transitionToRouteStub = sinon.stub(controller, 'transitionToRoute');

    sinon.stub(controller, '_handleSkillChangelog').resolves();
    sinon.stub(controller, '_duplicateLiveChallenges').resolves([]);
    sinon.stub(controller, '_setVersion');
    controller.loader = {
      start: sinon.stub(),
      stop:  sinon.stub()
    };
    controller.notify = {
      message: sinon.stub()
    };

    const competence = {
      get() {
        return 'competenceId';
      }
    };
    const currentSkill = store.createRecord('skill',{
      id: 'rec_1',
      pixId: 'pix_1',
      name: 'currentSkill'
    });
    const clonedSkill = {
      id: 'rec_2',
      pixId: 'pix_2',
      save: sinon.stub().resolves({}),
    };
    currentSkill.clone = sinon.stub().resolves(clonedSkill);
    controller.model = currentSkill;

    // when
    await controller._duplicateToLocationCallback('changelogValue', competence, 'newTube', 'level');

    // then
    const duplicateToLocationArgs = transitionToRouteStub.getCall(0).args[2];
    assert.equal(duplicateToLocationArgs.level, 'level');
    assert.equal(duplicateToLocationArgs.tube, 'newTube');
  });

  test('it should set a skill version', async function (assert) {
    // given
    const skill1 = { name: 'skill1', level: '1' };
    const skill2 = { name: 'skill2', level: '1' };
    const tube = { name: 'tube', filledSkills: [[skill1, skill2]] };

    // when
    await controller._setVersion(skill2, tube);

    // then
    assert.equal(skill2.version, 2);
  });

  test('it should clone only validated and draft challenges', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');

    const cloneToDuplicateStub = sinon.stub().returns({ save:sinon.stub().resolves({}) });

    const validatedChallenge = store.createRecord('challenge',{
      id: 'rec_1_1',
      pixId: 'pix_1_1',
      status: 'validé',
      name: 'validatedChallenge',
    });
    validatedChallenge.cloneToDuplicate = sinon.stub().returns({ save:sinon.stub().resolves(validatedChallenge) });

    const draftChallenge = store.createRecord('challenge',{
      id: 'rec_1_2',
      pixId: 'pix_1_2',
      status: 'proposé',
      name: 'draftChallenge',
    });
    draftChallenge.cloneToDuplicate = sinon.stub().returns({ save:sinon.stub().resolves(draftChallenge) });


    const archiveChallenge = store.createRecord('challenge',{
      id: 'rec_1_3',
      pixId: 'pix_1_3',
      status: 'archivé',
      name: 'archiveChallenge',
      cloneToDuplicate: cloneToDuplicateStub
    });
    const deletedChallenge = store.createRecord('challenge',{
      id: 'rec_1_4',
      pixId: 'pix_1_4',
      status: 'périmé',
      name: 'deletedChallenge',
      cloneToDuplicate: cloneToDuplicateStub
    });
    const skill =  store.createRecord('skill',{
      id: 'rec_1',
      pixId: 'pix_1',
      challenges: [validatedChallenge, draftChallenge, archiveChallenge, deletedChallenge]
    });
    controller.model = skill;

    // when
    const result = await controller._duplicateLiveChallenges();

    // then
    assert.equal(result.length, 2);
    assert.equal(result[0].name, 'validatedChallenge');
    assert.equal(result[1].name, 'draftChallenge');
  });
});

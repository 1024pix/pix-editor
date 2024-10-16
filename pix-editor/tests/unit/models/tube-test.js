import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | tube', function(hooks) {
  setupTest(hooks);
  let store;
  let skillRecord1, skillRecord2, skillRecord3, skillRecord4, skillRecord5, skillRecord6;
  let tube;

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
    skillRecord1 = store.createRecord('skill', {
      id: 'rec654258',
      level: 1,
      status: 'actif',
      challenges: [store.createRecord('challenge', {
        id: 'recChallenge0',
        genealogy: 'Prototype 1',
        status: 'validé',
      })],
    });
    skillRecord2 = store.createRecord('skill', {
      id: 'rec654259',
      level: 1,
      status: 'archivé',
    });
    skillRecord3 = store.createRecord('skill', {
      id: 'rec654260',
      level: 3,
      status: 'actif',
      challenges: [store.createRecord('challenge', {
        id: 'recChallenge1',
        genealogy: 'Prototype 1',
        status: 'validé',
      })],
    });
    skillRecord4 = store.createRecord('skill', {
      id: 'rec654261',
      level: 4,
      status: 'actif',
      challenges: [store.createRecord('challenge', {
        id: 'recChallenge2',
        genealogy: 'Prototype 1',
        status: 'validé',
      })],
    });
    skillRecord5 = store.createRecord('skill', {
      id: 'rec664261',
      level: 5,
      status: 'en construction',
      version: 1,
    });
    skillRecord6 = store.createRecord('skill', {
      id: 'rec674261',
      level: 6,
      status: 'périmé',
    });
    tube = store.createRecord('tube', {
      id: 'rec123456',
      name: 'tubeName',
      rawSkills: [
        skillRecord1
        , skillRecord2
        , skillRecord3
        , skillRecord4
        , skillRecord5
        , skillRecord6,
      ],
    });
  });

  test('it should return an array of skill with status is not `archivé` or `périmé`', function(assert) {
    assert.expect(4);
    // given
    const wrongStatus = ['archivé', 'périmé'];

    // when
    const liveSkills = tube.liveSkills;

    // then
    liveSkills.forEach((skill) => {
      assert.notOk(wrongStatus.includes(skill.status));
    });
  });

  test('it should return an array of all versions skills sorted and positioned by level', function(assert) {
    // given
    const expectedArray = [[skillRecord1, skillRecord2], false, [skillRecord3], [skillRecord4], [skillRecord5], [skillRecord6], false];

    // when
    const filledSkills = tube.filledSkills;

    // then
    assert.deepEqual(filledSkills, expectedArray);
  });

  test('it should return an array of productionSkill positioned by level', function(assert) {

    // given
    const expectedArray = [skillRecord1, false, skillRecord3, skillRecord4, false, false, false];

    // when
    const filledSkills = tube.filledProductionSkills;

    // then
    assert.deepEqual(filledSkills, expectedArray);
  });
  module('#draftSkill', function(hooks) {
    let skillRecord5v2, skillRecord1v2;
    hooks.beforeEach(async function() {
      skillRecord1v2 = store.createRecord('skill', {
        id: 'skillRecord1v2',
        level: 1,
        status: 'en construction',
        version: 2,
      });
      skillRecord5v2 = store.createRecord('skill', {
        id: 'skillRecord5v2',
        level: 5,
        status: 'en construction',
        version: 2,
      });
      const rawSkills = await tube.rawSkills;
      rawSkills.pushObject(skillRecord1v2);
      rawSkills.pushObject(skillRecord5v2);
      tube.rawSkills = rawSkills;
    });

    test('it should return an array of draftSkill positioned by level', function(assert) {
      // given
      const expectedArray = [[skillRecord1v2], false, false, false, [skillRecord5, skillRecord5v2], false, false];

      // when
      const filledSkills = tube.filledDraftSkills;

      // then
      assert.deepEqual(filledSkills, expectedArray);
    });

    test('it should return an array of last draftSkill positioned by level', function(assert) {
      // given
      const expectedArray = [skillRecord1v2, false, false, false, skillRecord5v2, false, false];

      // when
      const filledSkills = tube.filledLastDraftSkills;

      // then
      assert.deepEqual(filledSkills, expectedArray);
    });
  });

  test('it should get a next skill version', async function(assert) {

    // when
    const nextSkillVersion = tube.getNextSkillVersion(skillRecord2.level);

    // then
    assert.strictEqual(nextSkillVersion, 2);
  });

  module('#productionSkills', function() {
    test('returns validated skills in the tube', function(assert) {
      assert.strictEqual(tube.productionSkillCount, 3);
      assert.deepEqual(tube.productionSkills, [skillRecord1, skillRecord3, skillRecord4]);
      assert.ok(tube.hasProductionSkills);
    });
  });
});

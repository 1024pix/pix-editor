import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | tube', function(hooks) {
  setupTest(hooks);
  let store;
  const skill1 = {
    id: 'rec654258',
    level: 1,
    status:'actif'
  };
  const skill2 = {
    id: 'rec654259',
    level: 1,
    status:'archivé'

  };
  const skill3 = {
    id: 'rec654260',
    level: 3,
    status:'actif'

  };
  const skill4 = {
    id: 'rec654261',
    level: 4,
    status:'actif',
  };
  const skill5 = {
    id: 'rec664261',
    level: 5,
    status:'en construction',
  };
  const skill6 = {
    id: 'rec674261',
    level: 6,
    status:'périmé',
  };

  hooks.beforeEach (function() {
    store = this.owner.lookup('service:store');
  });

  // Replace this with your real tests.
  test('it should return an array of skill with status is not `archivé` or `périmé`', function(assert) {

    // given
    const tube = run(() => store.createRecord('tube', {
      id: 'rec123456',
      name: 'tubeName',
      rawSkills: [
        store.createRecord('skill',skill1)
        ,store.createRecord('skill',skill2)
        ,store.createRecord('skill',skill3)
        ,store.createRecord('skill',skill4)
        ,store.createRecord('skill',skill5)
        ,store.createRecord('skill',skill6)
      ]
    }));

    const wrongStatus = ['archivé', 'périmé'];

    // when
    const liveSkills = tube.liveSkills;

    // then
    liveSkills.forEach(skill=>{
      assert.notOk(wrongStatus.includes(skill.status));
    });
  });

  test('it should return an array of liveSkill sorted and positioned by level', function(assert) {

    // given
    const skillRecord1 = store.createRecord('skill',skill1);
    const skillRecord2 = store.createRecord('skill',skill2);
    const skillRecord3 = store.createRecord('skill',skill3);
    const skillRecord4 = store.createRecord('skill',skill4);
    const skillRecord5 = store.createRecord('skill',skill5);
    const skillRecord6 = store.createRecord('skill',skill6);
    const tube = run(() => store.createRecord('tube', {
      id: 'rec123456',
      name: 'tubeName',
      rawSkills: [
        skillRecord1
        ,skillRecord2
        ,skillRecord3
        ,skillRecord4
        ,skillRecord5
        ,skillRecord6
      ]
    }));

    const expectedArray = [skillRecord1, false, skillRecord3, skillRecord4, skillRecord5, false, false];

    // when
    const filledSkills = tube.filledSkills;

    // then
    assert.deepEqual(filledSkills,expectedArray);

  });
});

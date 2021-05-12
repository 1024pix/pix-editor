import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import sinon from 'sinon';

module('Unit | Model | skill', function(hooks) {
  setupTest(hooks);
  let store;
  const challenge1 = {
    id: 'rec654258',
    locales: ['Francophone','Franco Français'],
    status:'validé'
  };
  const challenge2 = {
    id: 'rec654259',
    locales: ['Anglais'],
    status:'validé'
  };
  const challenge3 = {
    id: 'rec654260',
    locales: ['Anglais'],
    status:'validé'
  };
  const challenge4 = {
    id: 'rec654261',
    locales: ['Franco Français'],
    status:'validé',
  };
  hooks.beforeEach (function() {
    store = this.owner.lookup('service:store');
  });

  test('it should return a map of unique language and alternatives', function(assert) {
    // given
    const skill = run(() => store.createRecord('skill', {
      id: 'rec123456',
      name: 'skillName',
      challenges: [
        store.createRecord('challenge',challenge1),
        store.createRecord('challenge',challenge2),
        store.createRecord('challenge',challenge3),
        store.createRecord('challenge',challenge4),
      ]
    }));

    // when
    const languagesAndAlternativesCount = skill.languagesAndAlternativesCount;

    // then
    assert.equal(languagesAndAlternativesCount.get('Anglais'),2);
  });

  test('it should return an array of unique language sorted', function(assert) {
    // given
    const skill = run(() => store.createRecord('skill', {
      id: 'rec123456',
      name: 'skillName',
      challenges: [
        store.createRecord('challenge',challenge1),
        store.createRecord('challenge',challenge2),
        store.createRecord('challenge',challenge3),
        store.createRecord('challenge',challenge4),
      ]
    }));

    // when
    const languages = skill.languages;
    const expected = ['Anglais', 'Franco Français', 'Francophone'];

    // then
    assert.deepEqual(languages,expected);
  });

  test('it should duplicate skill without location and with a draft status',async function (assert) {
    // given
    const idGeneratorStub = { newId: sinon.stub().returns('generatedId') };

    const tutorial1 = store.createRecord('tutorial', { title: 'tutoMore' });
    const tutorial2 = store.createRecord('tutorial', { title: 'tutoSolution1' });
    const tutorial3 = store.createRecord('tutorial', { title: 'tutoSolution2' });
    const tube = store.createRecord('tube', { title: 'tube' });
    const skill = run(() => store.createRecord('skill', {
      id: 'rec_1',
      pixId: 'pix_1',
      status: 'actif',
      competence: ['competenceId'],
      tube: tube,
      challenges: [store.createRecord('challenge',challenge1)],
      tutoSolution: [tutorial1],
      tutoMore: [tutorial2, tutorial3]
    }));

    skill.idGenerator = idGeneratorStub;
    // const ignoredFields = ['competence', 'level', 'tube', 'challenges'];

    // when
    const clonedSkill = await skill.clone();
    const tubeField = await clonedSkill.get('tube');

    // then
    assert.equal(clonedSkill.level, null);
    assert.equal(clonedSkill.competence, null);
    assert.equal(tubeField, null);

    assert.equal(clonedSkill.challenges.length, 0);
    assert.equal(clonedSkill.status, 'en construction');
    assert.equal(clonedSkill.pixId, 'generatedId');

    assert.equal(clonedSkill.tutoSolution.length, 1);
    assert.equal(clonedSkill.tutoMore.length, 2);
  });
});

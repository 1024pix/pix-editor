import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Model | skill', function(hooks) {
  setupTest(hooks);
  let store;
  const challenge1 = {
    id: 'rec654258',
    locales: ['Francophone', 'Franco Français'],
    status: 'validé',
  };
  const challenge2 = {
    id: 'rec654259',
    locales: ['Anglais'],
    status: 'validé',
  };
  const challenge3 = {
    id: 'rec654260',
    locales: ['Anglais'],
    status: 'validé',
  };
  const challenge4 = {
    id: 'rec654261',
    locales: ['Franco Français'],
    status: 'validé',
  };
  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  test('it should return a map of unique language and alternatives', function(assert) {
    // given
    const skill = store.createRecord('skill', {
      id: 'rec123456',
      name: 'skillName',
      challenges: [
        store.createRecord('challenge', challenge1),
        store.createRecord('challenge', challenge2),
        store.createRecord('challenge', challenge3),
        store.createRecord('challenge', challenge4),
      ],
    });

    // when
    const languagesAndAlternativesCount = skill.languagesAndAlternativesCount;

    // then
    assert.strictEqual(languagesAndAlternativesCount.get('Anglais'), 2);
  });

  test('it should return an array of unique language sorted', function(assert) {
    // given
    const skill = store.createRecord('skill', {
      id: 'rec123456',
      name: 'skillName',
      challenges: [
        store.createRecord('challenge', challenge1),
        store.createRecord('challenge', challenge2),
        store.createRecord('challenge', challenge3),
        store.createRecord('challenge', challenge4),
      ],
    });

    // when
    const languages = skill.languages;
    const expected = ['Anglais', 'Franco Français', 'Francophone'];

    // then
    assert.deepEqual(languages, expected);
  });

  test('it should clone skill with save method and adapterOptions', async function(assert) {
    // given
    const level = Symbol('level');
    const storeStub = {
      createRecord: sinon.stub(),
    };
    const saveStub = sinon.stub();
    storeStub.createRecord.returns({
      save: saveStub,
    });

    const tube = store.createRecord('tube', { pixId: 'tubeId' });
    const skill = store.createRecord('skill', {
      id: 'rec_1',
      pixId: 'pix_1',
      status: 'actif',
      competence: ['competenceId'],
    });

    skill.myStore = storeStub;
    // when
    await skill.clone({ tubeDestination: tube, level });

    // then
    assert.ok(saveStub.calledOnce);
    assert.ok(saveStub.calledWith({ adapterOptions: {
      clone: true,
      skillIdToClone: 'pix_1',
      tubeDestinationId: 'tubeId',
      level,
    },
    }));
  });
});

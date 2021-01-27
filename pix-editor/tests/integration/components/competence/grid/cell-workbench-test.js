import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | competence/grid/cell-workbench', function(hooks) {
  setupRenderingTest(hooks);
  let store;
  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  test('it should display a prototype count by status', async function(assert) {
    // given
    const validatedPrototype = store.createRecord('challenge',{
      id: 'recChallenge0',
      genealogy: 'Prototype 1',
      status: 'validé'
    });
    const archivedPrototype1 = store.createRecord('challenge',{
      id: 'recChallenge1',
      genealogy: 'Prototype 1',
      status: 'archivé'
    });
    const archivedPrototype2 = store.createRecord('challenge',{
      id: 'recChallenge2',
      genealogy: 'Prototype 1',
      status: 'archivé'
    });
    const archivedPrototype3 = store.createRecord('challenge',{
      id: 'recChallenge3',
      genealogy: 'Prototype 1',
      status: 'archivé'
    });
    const deletedPrototype1 = store.createRecord('challenge',{
      id: 'recChallenge4',
      genealogy: 'Prototype 1',
      status: 'périmé'
    });
    const deletedPrototype2 = store.createRecord('challenge',{
      id: 'recChallenge5',
      genealogy: 'Prototype 1',
      status: 'périmé'
    });
    const draftPrototype1 = store.createRecord('challenge',{
      id: 'recChallenge6',
      genealogy: 'Prototype 1',
      status: 'proposé'
    });
    const skill1 = store.createRecord('skill',{
      id: 'recSkill1',
      name: 'skill1',
      level: 1,
      challenges: [validatedPrototype, archivedPrototype1, archivedPrototype2, draftPrototype1, deletedPrototype1]
    });
    const skill2 = store.createRecord('skill',{
      id: 'recSkill2',
      name: 'skill1',
      level: 1,
      challenges: [archivedPrototype3, deletedPrototype2]
    });

    this.skill = skill1;
    this.skills = [skill1, skill2];

    // when
    await render(hbs`<Competence::Grid::CellWorkbench @skill={{this.skill}} @skills={{this.skills}}/>`);

    // then
    assert.dom('[data-test-draft-prototype-count]').hasText('1');
    assert.dom('[data-test-validated-prototype-count]').hasText('1');
    assert.dom('[data-test-archived-prototype-count]').hasText('3');
    assert.dom('[data-test-deleted-prototype-count]').hasText('2');
  });
});

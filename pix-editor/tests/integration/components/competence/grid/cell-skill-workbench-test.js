import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../../setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { run } from '@ember/runloop';


module('Integration | Component | competence/grid/cell-skill-workbench', function(hooks) {
  setupIntlRenderingTest(hooks);

  let store;
  let skillRecord1, skillRecord2, skillRecord3, skillRecord4, skillRecord5, skillRecord6;
  const skillName = '@skill1';
  let tube;

  hooks.beforeEach (async function() {
    // given
    store = this.owner.lookup('service:store');
    skillRecord1 = store.createRecord('skill',{
      id: 'rec654258',
      name: skillName,
      level: 1,
      status:'actif',
      challenges: [store.createRecord('challenge',{
        id: 'recChallenge0',
        genealogy: 'Prototype 1',
        status: 'validé'
      })]
    });
    skillRecord2 = store.createRecord('skill',{
      id: 'rec654259',
      level: 1,
      name: skillName,
      status:'archivé'
    });
    skillRecord3 = store.createRecord('skill',{
      id: 'rec654260',
      level: 1,
      name: skillName,
      status:'en construction',
    });
    skillRecord4 = store.createRecord('skill',{
      id: 'rec654261',
      level: 1,
      name: skillName,
      status:'archivé',
    });
    skillRecord5 = store.createRecord('skill',{
      id: 'rec664261',
      level: 1,
      name: skillName,
      status:'en construction',
    });
    skillRecord6 = store.createRecord('skill',{
      id: 'rec674261',
      level: 1,
      name: skillName,
      status:'périmé',
    });
    tube = run(() => store.createRecord('tube',{
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
    this.skill = skillRecord1;
    this.skills = [skillRecord1, skillRecord2, skillRecord3, skillRecord4, skillRecord5, skillRecord6];
    this.tube = tube;

    // when
    await render(hbs`<Competence::Grid::CellSkillWorkbench @tube={{this.tube}} @skill={{this.skill}} @skills={{this.skills}}/>`);
  });

  test('it should display a skill count by status', async function(assert) {
    // then
    assert.dom('[data-test-draft-count]').hasText('2');
    assert.dom('[data-test-active-count]').hasText('1');
    assert.dom('[data-test-archived-count]').hasText('2');
    assert.dom('[data-test-obsolete-count]').hasText('1');
  });

});

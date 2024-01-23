import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | competence', function(hooks) {
  setupTest(hooks);

  test('it should return live theme', function(assert) {
    const store = this.owner.lookup('service:store');

    const liveTheme = store.createRecord('theme', {
      name: 'liveTheme',
    });

    const workbenchTheme = store.createRecord('theme', {
      name: 'workbench_theme',
    });

    const competence = store.createRecord('competence', {
      title: 'competence1',
      rawThemes: [liveTheme, workbenchTheme]
    });

    assert.deepEqual(competence.themes, [liveTheme]);
  });

  module('#productionTubes', function() {
    test('returns tubes with valided skills', function(assert) {
      const store = this.owner.lookup('service:store');

      const liveTube = store.createRecord('tube', {
        name: 'liveTube',
        rawSkills: [
          store.createRecord('skill', { status: 'actif' })
        ]
      });

      const workbenchTube = store.createRecord('tube', {
        name: 'workbenchTube',
      });

      const competence = store.createRecord('competence', {
        title: 'competence1',
        rawTubes: [liveTube, workbenchTube]
      });

      assert.deepEqual(competence.productionTubes, [liveTube]);
    });
  });
});

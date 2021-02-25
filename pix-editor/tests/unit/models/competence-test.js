import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

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

    const competence = run(() => store.createRecord('competence', {
      title: 'competence1',
      rawThemes: [liveTheme, workbenchTheme]
    }));

    assert.deepEqual(competence.themes, [liveTheme]);
  });
});

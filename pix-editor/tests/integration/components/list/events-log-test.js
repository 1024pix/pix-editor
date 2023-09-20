import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import { render, findAll } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | list/events-log', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display a list of skill logs', async function(assert) {
    //given
    const skillLog1 = {
      recordId: 'rec123456',
      text: 'some text',
      author: 'DEV',
      date: '14/07/1986',
      action: 'suppression',
      skillName: '@acquis1'
    };
    const skillLog2 = {
      recordId: 'rec123456',
      text: 'some text 2',
      author: 'DEV',
      date: '14/07/1986',
      action: 'ajout',
      skillName: '@acquis2'
    };
    const skillLogs = [skillLog1,skillLog2];

    this.skillLogs = skillLogs;

    //when
    await render(hbs`<List::EventsLog @list={{this.skillLogs}}/>`);

    //then
    assert.strictEqual(findAll('[data-test-skillLog]').length, skillLogs.length);
  });
});

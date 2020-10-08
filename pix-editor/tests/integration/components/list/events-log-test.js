import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | list/events-log', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display a list of skill logs', async function(assert) {
    //given
    const skillLog1 = {
      recordId: 'rec123456',
      text: 'some text',
      author: 'DEV',
      date: '14/07/1986'
    };
    const skillLog2 = {
      recordId: 'rec123456',
      text: 'some text 2',
      author: 'DEV',
      date: '14/07/1986'
    };
    const skillLogs = [skillLog1,skillLog2];

    this.skillLogs = skillLogs;

    //when
    await render(hbs`<List::EventsLog @list={{skillLogs}}/>`);

    //then

    assert.equal(this.element.querySelectorAll('[data-test-skillLog]').length, skillLogs.length);
  });
});

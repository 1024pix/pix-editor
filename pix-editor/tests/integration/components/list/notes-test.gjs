import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupIntlRenderingTest } from '../../../setup-intl-rendering';
import Notes from 'pix-editor/components/list/notes';

module('Integration | Component | note-list', function (hooks) {
  setupIntlRenderingTest(hooks);

  const myNote1 = {
    text: 'Some text 1',
    author: 'me',
    date: new Date(2020, 8, 22),
    status: 'en cours',
  };
  const myNote2 = {
    text: 'Some text 2',
    author: 'me',
    date: new Date(2020, 8, 25),
    status: 'terminé',
  };
  const otherNote = {
    text: 'Some text 3',
    author: 'xxx',
    date: new Date(2020, 3, 22),
    status: 'en cours',
  };
  const log1 = {
    text: 'Some log 1',
    author: 'me',
    date: new Date(2020, 8, 30),
    changelog: true,
  };
  const log2 = {
    text: 'Some log 2',
    author: 'xxx',
    date: new Date(2020, 8, 28),
    changelog: true,
  };
  const notes = [myNote1, myNote2, otherNote, log1, log2];
  hooks.beforeEach(function () {
    this.notes = notes;
  });

  test('it renders', async function (assert) {
    const self = this;

    // when
    await render(<template><Notes @list={{self.notes}} /></template>);

    // then
    assert.dom('.pix-table').exists();
  });

  test('it should display a list of notes', async function (assert) {
    const self = this;

    // when
    await render(<template><Notes @list={{self.notes}} /></template>);

    // then
    // 1 data-test-note per note + 1 for the header
    assert.dom('[data-test-note]').exists({ count: notes.length + 1 });
  });

  test('it should display authors when displayAuthor is `true`', async function (assert) {
    const self = this;

    // given
    this.displayAuthor = true;

    // when
    await render(<template><Notes @list={{self.notes}} @displayAuthor={{self.displayAuthor}} /></template>);

    // then
    assert.dom('.author-note').exists();
  });

  test('it should not display authors when displayAuthor is `false`', async function (assert) {
    const self = this;

    // given
    this.displayAuthor = false;

    // when
    await render(<template><Notes @list={{self.notes}} @displayAuthor={{self.displayAuthor}} /></template>);

    // then
    assert.dom('.author-note').doesNotExist();
  });

  test('it should display note status when displayStatus is `true`', async function (assert) {
    const self = this;

    // given
    this.displayStatus = true;

    // when
    await render(<template><Notes @list={{self.notes}} @displayStatus={{self.displayStatus}} /></template>);

    // then
    assert.dom('.status-note').exists();
  });

  test('it should not display note status when displayStatus is `false`', async function (assert) {
    const self = this;

    // given
    this.displayStatus = false;

    // when
    await render(<template><Notes @list={{self.notes}} @displayStatus={{self.displayStatus}} /></template>);

    // then
    assert.dom('.status-note').doesNotExist();
  });
});

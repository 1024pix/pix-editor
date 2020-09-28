import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | note-list', function (hooks) {
  setupRenderingTest(hooks);

  const myNote1 = {
    text: 'Some text 1',
    author: 'me',
    date: new Date(2020, 8, 22),
    status: 'en cours'
  };
  const myNote2 = {
    text: 'Some text 2',
    author: 'me',
    date: new Date(2020, 8, 25),
    status: 'terminé'
  };
  const otherNote = {
    text: 'Some text 3',
    author: 'xxx',
    date: new Date(2020, 3, 22),
    status: 'en cours'
  };
  const log1 = {
    text: 'Some log 1',
    author: 'me',
    date: new Date(2020, 8, 30),
    changelog: true
  };
  const log2 = {
    text: 'Some log 2',
    author: 'xxx',
    date: new Date(2020, 8, 28),
    changelog: true
  };
  const notes = [myNote1, myNote2, otherNote, log1, log2];
  hooks.beforeEach(function () {
    this.set('notes', notes);
  });

  test('it renders', async function (assert) {
    //when
    await render(hbs`<List::Notes @list={{this.notes}}/>`);

    //then
    assert.dom('.ember-table').exists();
  });

  test('it should display a list of notes', async function (assert) {
    //when
    await render(hbs`<List::Notes @list={{this.notes}}/>`);

    //then
    const notesList = this.element.querySelectorAll('[data-test-note]');
    assert.equal(notesList.length, notes.length);
  });

  test('it should display authors when displayAuthor is `true`', async function (assert) {
    //given
    this.set('displayAuthor', true);

    //when
    await render(hbs`<List::Notes @list={{this.notes}} @displayAuthor={{this.displayAuthor}}/>`);

    //then
    assert.dom('[data-test-note] .author-note').exists();
  });

  test('it should not display authors when displayAuthor is `false`', async function (assert) {
    //given
    this.set('displayAuthor', false);

    //when
    await render(hbs`<List::Notes @list={{this.notes}} @displayAuthor={{this.displayAuthor}}/>`);

    //then
    assert.dom('[data-test-note] .author-note').doesNotExist();
  });

  test('it should display note status when displayStatus is `true`', async function (assert) {
    //given
    this.set('displayStatus', true);

    //when
    await render(hbs`<List::Notes @list={{this.notes}} @displayStatus={{this.displayStatus}}/>`);

    //then
    assert.dom('[data-test-note] .status-note').exists();

  });

  test('it should not display note status when displayStatus is `false`', async function (assert) {
    //given
    this.set('displayStatus', false);

    //when
    await render(hbs`<List::Notes @list={{this.notes}} @displayStatus={{this.displayStatus}}/>`);

    //then
    assert.dom('[data-test-note] .status-note').doesNotExist();

  });
});

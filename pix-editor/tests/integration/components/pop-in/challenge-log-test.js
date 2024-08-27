import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { setupIntlRenderingTest } from '../../../setup-intl-rendering';

module('Integration | Component | popin-challenge-log', function(hooks) {
  setupIntlRenderingTest(hooks);

  let paginatedQueryLoadNotesStub;

  hooks.beforeEach(function() {
    paginatedQueryLoadNotesStub = sinon.stub();
    class PaginatedQueryService extends Service {
      query = paginatedQueryLoadNotesStub.resolves([note]);
    }

    this.owner.unregister('service:paginatedQuery');
    this.owner.register('service:paginatedQuery', PaginatedQueryService);
    const note = {
      text: 'Some text 1',
      author: 'me',
      date: new Date(2020, 8, 22),
      status: 'en cours',
    };
    const challenge = {
      id: 'rec654258',
      locales: ['Francophone', 'Franco Français'],
      instruction: 'Some instructions 1',
    };
    this.closeAction = function() {};
    this.challenge = challenge;
  });

  test('it renders', async function(assert) {
    //when
    await render(hbs`<PopIn::Challenge-log @close={{this.closeAction}} @challenge={{this.challenge}}/>`);

    //then
    assert.dom('.pix-modal').exists();
  });

  test('it queries notes', async function(assert) {
    //when
    await render(hbs`<PopIn::Challenge-log @close={{this.closeAction}} @challenge={{this.challenge}}/>`);

    //then
    assert.deepEqual(paginatedQueryLoadNotesStub.getCall(0).args, ['note', { filterByFormula: `AND(Record_Id = '${this.challenge.id}', Statut != 'archive', Changelog='non')`, sort: [{ field: 'Date', direction: 'desc' }] }]);
  });

  test('it queries changelogs', async function(assert) {
    //when
    await render(hbs`<PopIn::Challenge-log @close={{this.closeAction}} @challenge={{this.challenge}}/>`);

    //then
    assert.deepEqual(paginatedQueryLoadNotesStub.getCall(1).args, ['changelogEntry', { filterByFormula: `AND(Record_Id = '${this.challenge.id}', Changelog='oui')`, sort: [{ field: 'Date', direction: 'desc' }] }]);
  });

});

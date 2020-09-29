import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import Service from '@ember/service';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | popin-challenge-log', function(hooks) {
  setupRenderingTest(hooks);

  let paginatedQueryService, paginatedQueryLoadNotesStub;

  hooks.beforeEach(function() {
    paginatedQueryService = Service.extend({});
    this.owner.unregister('service:paginatedQuery');
    this.owner.register('service:paginatedQuery', paginatedQueryService);
    const note = {
      text: 'Some text 1',
      author: 'me',
      date: new Date(2020, 8, 22),
      status: 'en cours'
    };

    const challenge = {
      pixId: 'rec654258',
      languages: ['Francophone','Franco Français'],
      instructions: 'Some instructions 1'
    };
    this.closeAction = function() {};
    this.challenge = challenge;
    paginatedQueryLoadNotesStub = sinon.stub().resolves([note]);
    paginatedQueryService.prototype.query = paginatedQueryLoadNotesStub;
  });

  test('it renders', async function(assert) {
    //when
    await render(hbs`<PopIn::Challenge-log @close={{this.closeAction}} @challenge={{this.challenge}}/>`);

    //then
    assert.dom('.ember-modal-dialog').exists();
  });

  test('it queries notes', async function(assert) {
    //when
    await render(hbs`<PopIn::Challenge-log @close={{this.closeAction}} @challenge={{this.challenge}}/>`);

    //then
    assert.deepEqual(paginatedQueryLoadNotesStub.getCall(0).args,['note',{ filterByFormula:`AND(Record_Id = '${this.challenge.pixId}', Statut != 'archive', Changelog='non')`, sort: [{ field: 'Date', direction: 'desc' }] }]);
  });

  test('it queries changelogs when changelog tab is displayed', async function(assert) {
    //when
    await render(hbs`<PopIn::Challenge-log @close={{this.closeAction}} @challenge={{this.challenge}}/>`);
    await click('[data-test-changelog-tab]');

    //then
    assert.deepEqual(paginatedQueryLoadNotesStub.getCall(1).args,['changelogEntry', { filterByFormula:`AND(Record_Id = '${this.challenge.pixId}', Changelog='oui')`, sort: [{ field: 'Date', direction: 'desc' }] }]);
  });

});

import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import sinon from 'sinon';

module('Integration | Component | events-log/cell-skill-log', function(hooks) {
  setupRenderingTest(hooks);
  let loadedSkillStub, skillId;

  hooks.beforeEach(function() {
    const store = Service.extend({});
    this.owner.unregister('service:store');
    this.owner.register('service:store', store);

    skillId = 'rec123456';
    const skill = {
      name: '@skill2',
      pixId: 'rec123456'
    };
    this.skillId = skillId;

    loadedSkillStub = sinon.stub().resolves([skill]);
    store.prototype.query = loadedSkillStub;
  });

  test('it should return a skill name', async function(assert) {
    //given


    // when
    await render(hbs`<EventsLog::CellSkillLog @skillId={{this.skillId}}/>`);

    //then

    assert.equal(this.element.textContent.trim(), '@skill2');
  });

  test('it should query skill', async function(assert) {

    // when
    await render(hbs`<EventsLog::CellSkillLog @skillId={{this.skillId}}/>`);

    //then

    assert.deepEqual(loadedSkillStub.getCall(0).args, ['skill', {
      filterByFormula: `SEARCH('${skillId}', {id persistant})`,
    }]);
  });
});

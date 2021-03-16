import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';
import sinon from 'sinon';
import EmberObject from '@ember/object';

module('Integration | Component | tube-form', function(hooks) {
  setupRenderingTest(hooks);

  module('is creation', function (hooks) {
    let setEmptyMandatoryFieldStub, theme1;

    hooks.beforeEach(async function () {
      // given
      const store = this.owner.lookup('service:store');
      theme1 = store.createRecord('theme', {
        name: 'theme1'
      });
      const theme2 = store.createRecord('theme', {
        name: 'theme2'
      });
      const competence = store.createRecord('competence', {
        name: 'competence1',
        rawThemes: [theme1, theme2]
      });
      class CurrentDataService extends Service {
        getCompetence() {
          return competence;
        }
      }
      this.owner.register('service:currentData', CurrentDataService);

      setEmptyMandatoryFieldStub = sinon.stub();
      this.set('setEmptyMandatoryField', setEmptyMandatoryFieldStub);

    });

    test('it should display a selection of theme', async function(assert) {
      // given
      const expectedOptions =  ['theme1', 'theme2'];

      // when
      await render(hbs`<Form::Tube @creation={{true}}
                                   @setEmptyMandatoryField={{this.setEmptyMandatoryField}} />`);

      await click('[data-test-select-theme] .ember-basic-dropdown-trigger');

      // then
      const options = findAll('.ember-basic-dropdown-content>.ember-power-select-options>li');
      assert.ok(setEmptyMandatoryFieldStub.calledWith(true));
      options.forEach((option, index) => {
        assert.dom(option).hasText(expectedOptions[index]);
      });
    });

    test('it should set a theme for tube', async function(assert) {
      // given
      const tube = EmberObject.create({});
      this.set('tube', tube);

      // when
      await render(hbs`<Form::Tube @creation={{true}}
                                   @tube={{this.tube}}
                                   @setEmptyMandatoryField={{this.setEmptyMandatoryField}} />`);
      await click('[data-test-select-theme] .ember-basic-dropdown-trigger');
      await click(findAll('.ember-basic-dropdown-content>.ember-power-select-options>li')[0]);

      // then
      assert.equal(setEmptyMandatoryFieldStub.getCall(1).args[0], false);
      assert.deepEqual(tube.theme, theme1);
    });
  });

});

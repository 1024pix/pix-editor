import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

module('Integration | Component | pop-in/tutorial', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
   //given
    this.set('close', () => {});
    this.set('saveTutorial', () => {});
    this.set('tutorial', {});
    //when
    // await render(hbs`{{pop-in/tutorial close=(action close) saveTutorial=(action saveTutorial) tutorial=tutorial}}`);
    await render(hbs`<PopIn::Tutorial @close={{this.close}} @tutorial={{this.tutorial}} @saveTutorial={{this.saveTutorial}}/>`);

    //then
    assert.dom('.ember-modal-dialog').exists();

  });

  test('save input should be disabled if mandatory field are empty', async function(assert) {
   //given
    this.set('close', () => {});
    this.set('saveTutorial', () => {});
    this.set('tutorial', {
      title:'',
      language:'',
      link:'',
      source:'',
      license:'',
      format:'',
      duration:'',
      level:'',
      tags:[]
    });
    //when

    await render(hbs`<PopIn::Tutorial @close={{this.close}} @tutorial={{this.tutorial}} @saveTutorial={{this.saveTutorial}}/>`);

    //then
    // assert.dom('.ember-modal-dialog').exists();
    assert.equal(this.element.querySelector('.ui.button.positive').disabled, true)
  });

  test('save input should not be disabled if mandatory field are empty', async function(assert) {
   //given
    this.set('close', () => {});
    this.set('saveTutorial', () => {});
    this.set('tutorial', {
      title:'title',
      language:'fr-fr',
      link:'link',
      source:'source',
      license:'',
      format:'image',
      duration:'00:20:00',
      level:'',
      tags:[]
    });

    //when
    await render(hbs`<PopIn::Tutorial @close={{this.close}} @tutorial={{this.tutorial}} @saveTutorial={{this.saveTutorial}}/>`);

    //then
    assert.equal(this.element.querySelector('.ui.button.positive').disabled, false)
  });
});

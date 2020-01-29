import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | main-sidebar', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders main-sideBar', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    //
    // this.set('executeAction', function() {});
    // this.set('openConfigurationAction', function() {});
    this.set('openAction', function() {});
    this.set('loadingAction', function() {});
    this.set('finishedAction', function() {});
    this.set('messageAction', function() {});
    this.set('burger', {
      state:{
        actions:{
          close:function() {}
        }
      }
    });

    await render(hbs`{{main-sidebar openConfiguration=(action openAction)
    isLoading=(action loadingAction)
    finishedLoading=(action finishedAction)
    showMessage=(action messageAction)
    burger=burger
    }}`);

    assert.dom('.main-sidebar').exists();
  });
});


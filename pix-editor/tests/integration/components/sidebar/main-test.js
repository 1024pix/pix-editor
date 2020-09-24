import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Service from '@ember/service';

module('Integration | Component | main-sidebar', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders main-sideBar', async function(assert) {
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

    this.owner.register('service:currentData', class MockService extends Service {
      getAreas() {
        return [];
      }
      getSources() {
        return [];
      }
      getSource() {
        return '';
      }
    });

    await render(hbs`{{sidebar/main openLogout=(action openAction)
    showMessage=(action messageAction)
    burger=burger
    }}`);

    assert.dom('.main-sidebar').exists();
  });
});


import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';
import sinon from 'sinon';

module('Integration | Component | logout', function(hooks) {
  setupRenderingTest(hooks);
  
  test('it should ask for deconnection', async function(assert) {
    // given
    this.onDeny = sinon.stub();

    // when
    await render(hbs`<PopIn::Logout @onDeny={{this.onDeny}}/>`);

    // then
    assert.dom('[data-test-logout-message]').exists();
  });

  module('deny button', function() {
    
    test('it should call onDeny function', async function(assert) {
      // given
      this.onDeny = sinon.stub();
      await render(hbs`<PopIn::Logout @onDeny={{this.onDeny}}/>`);
      
      // when
      await click('[data-test-logout-cancel-button]');
      
      // then
      assert.equal(this.onDeny.called, true);
    });
  });

  module('ok button', function(hooks) {
    let windowReloadStub;

    hooks.beforeEach(async function() {
      // given
      this.onDeny = sinon.stub();
      localStorage.setItem('pix-api-key', 'api-key');
      await render(hbs`<PopIn::Logout @onDeny={{this.onDeny}}/>`);
      windowReloadStub = sinon.stub();
      class MockWindowService extends Service {
        reload() {
          return windowReloadStub();
        }
      }
      this.owner.register('service:window', MockWindowService);
      
      // when
      await click('[data-test-logout-ok-button]');
    });

    test('it should remove apiKey from local storage', async function(assert) {
      //then
      assert.equal(localStorage.getItem('pix-api-key'), undefined);
    });
    
    test('it should reload application', async function(assert) {
      //then
      assert.equal(windowReloadStub.called, true);
    });
    
  });
      
});

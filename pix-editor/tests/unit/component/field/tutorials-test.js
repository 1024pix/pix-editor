import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | field/tutorials', function(hooks) {
  setupTest(hooks);
  let component;

  hooks.beforeEach(function() {
    component = createGlimmerComponent('component:field/tutorials');
  });

  module('#getSearchTutorialResults', function(hooks) {
    let queryStub;

    hooks.beforeEach(function() {
      queryStub = sinon.stub();
      component.store.query = queryStub;
    });

    test('it should search tutorials', async function(assert) {
      queryStub.resolves([
        { id: 'tutorialId', title: 'test', tagsTitle: '' },
      ]);

      const results = await component.getSearchTutorialResults('Hello');
      assert.ok(queryStub.calledOnce);
      assert.ok(queryStub.calledWith('tutorial', {
        filter: { title: 'hello' },
      }));
      assert.deepEqual(results, [
        { title: 'test', description: false, id: 'tutorialId' },
      ]);
    });

    test('it should search tutorials by tags', async function(assert) {
      queryStub.resolves([
        { id: 'tutorialId', title: 'test', tagsTitle: '' },
      ]);

      const results = await component.getSearchTutorialResults('>Hello');

      assert.ok(queryStub.calledOnce);
      assert.ok(queryStub.calledWith('tutorial', {
        filter: { tagTitles: ['hello'] },
      }));
      assert.deepEqual(results, [
        { title: 'test', description: 'TAG : ', id: 'tutorialId' },
      ]);
    });

    test('it should search tutorials by multiple tags', async function(assert) {
      queryStub.resolves([
        { id: 'tutorialId', title: 'test', tagsTitle: '' },
      ]);

      const results = await component.getSearchTutorialResults('>hello >world');

      assert.ok(queryStub.calledOnce);
      assert.ok(queryStub.calledWith('tutorial', {
        filter: { tagTitles: ['hello', 'world'] },
      }));
      assert.deepEqual(results, [
        { title: 'test', description: 'TAG : ', id: 'tutorialId' },
      ]);
    });

    test('it should escape single quotes', async function(assert) {
      queryStub.resolves([ ]);

      await component.getSearchTutorialResults('Coco l\'asticot a mangé l\'abricot');
      assert.ok(queryStub.calledOnce);
      assert.ok(queryStub.calledWith('tutorial', {
        filter: { title: 'coco l\\\'asticot a mangé l\\\'abricot' },
      }));
    });
  });
});

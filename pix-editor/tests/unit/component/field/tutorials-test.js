import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import sinon from 'sinon';

module('unit | Component | field/tutorials', function(hooks) {
  setupTest(hooks);
  let component;

  hooks.beforeEach(function() {
    component = createGlimmerComponent('component:field/tutorials');
  });

  module('#getSearchTutorialResults', function() {
    test('it should search tutorials', async function(assert) {
      const queryStub = sinon.stub().resolves([
        { id: 'tutorialId', title: 'test', tagsTitle: '' }
      ]);
      component.store.query = queryStub;

      const results = await component.getSearchTutorialResults('Hello');
      assert.ok(queryStub.calledOnce);
      assert.ok(queryStub.calledWith('tutorial', {
        filterByFormula: 'FIND(\'hello\', LOWER(Titre))',
        maxRecords: 100,
        sort: [{ field: 'Titre', direction: 'asc' }]
      }));
      assert.deepEqual(results, [
        { title: 'test', description: false, id: 'tutorialId' }
      ]);
    });

    test('it should search tutorials by tags', async function(assert) {
      const queryStub = sinon.stub().resolves([
        { id: 'tutorialId', title: 'test', tagsTitle: '' }
      ]);
      component.store.query = queryStub;

      const results = await component.getSearchTutorialResults('>Hello');

      assert.ok(queryStub.calledOnce);
      assert.ok(queryStub.calledWith('tutorial', {
        filterByFormula: 'AND(FIND(\'hello\', LOWER(Tags)))',
        maxRecords: 100,
        sort: [{ field: 'Titre', direction: 'asc' }]
      }));
      assert.deepEqual(results, [
        { title: 'test', description: 'TAG : ', id: 'tutorialId' }
      ]);
    });

    test('it should search tutorials by multiple tags', async function(assert) {
      const queryStub = sinon.stub().resolves([
        { id: 'tutorialId', title: 'test', tagsTitle: '' }
      ]);
      component.store.query = queryStub;

      const results = await component.getSearchTutorialResults('>hello >world');

      assert.ok(queryStub.calledOnce);
      assert.ok(queryStub.calledWith('tutorial', {
        filterByFormula: 'AND(FIND(\'hello\', LOWER(Tags)), FIND(\'world\', LOWER(Tags)))',
        maxRecords: 100,
        sort: [{ field: 'Titre', direction: 'asc' }]
      }));
      assert.deepEqual(results, [
        { title: 'test', description: 'TAG : ', id: 'tutorialId' }
      ]);
    });
  });
});

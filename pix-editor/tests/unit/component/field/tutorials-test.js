import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import sinon from 'sinon';

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
        { id: 'tutorialId', title: 'test', tagsTitle: '' }
      ]);

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
      queryStub.resolves([
        { id: 'tutorialId', title: 'test', tagsTitle: '' }
      ]);

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
      queryStub.resolves([
        { id: 'tutorialId', title: 'test', tagsTitle: '' }
      ]);

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

    test('it should escape single quotes', async function (assert) {
      queryStub.resolves([ ]);

      await component.getSearchTutorialResults('Coco l\'asticot a mangé l\'abricot');
      assert.ok(queryStub.calledOnce);
      assert.ok(queryStub.calledWith('tutorial', {
        filterByFormula: 'FIND(\'coco l\\\'asticot a mangé l\\\'abricot\', LOWER(Titre))',
        maxRecords: 100,
        sort: [{ field: 'Titre', direction: 'asc' }]
      }));
    });
  });
});

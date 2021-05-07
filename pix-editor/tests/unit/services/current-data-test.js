import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberObject from '@ember/object';

module('Unit | Service | current-data', function(hooks) {
  setupTest(hooks);
  let service, pixFramework, pixFranceFramework, pixArea, pixFranceArea, competence, prototype;

  hooks.beforeEach(function() {
    // Given
    prototype = EmberObject.create({
      id: 'prototype'
    });
    competence = EmberObject.create({
      id: 'competence'
    });
    pixFranceArea = EmberObject.create({
      id: 'pixFranceArea'
    });
    pixArea = EmberObject.create({
      id: 'pixArea'
    });
    pixFranceFramework = EmberObject.create({
      id: 'pixFranceFramework',
      name: 'France',
      areas: [pixFranceArea]
    });
    pixFramework = EmberObject.create({
      id: 'pixFramework',
      name: 'Pix',
      areas: [pixArea]
    });
    service = this.owner.lookup('service:current-data');
    service.setFrameworks([pixFramework, pixFranceFramework]);
    service.setFramework(pixFramework);
    service.setAreas([pixArea, pixFranceArea]);
    service.setCompetence(competence);
    service.setPrototype(prototype);
  });

  test('it should return frameworks', function(assert) {
    // when
    const frameworks = service.getFrameworks();

    // then
    assert.deepEqual(frameworks, [pixFramework, pixFranceFramework]);
  });

  test('it should return framework', function(assert) {
    // when
    const framework = service.getFramework();

    // then
    assert.deepEqual(framework, pixFramework);
  });

  test('it should return all areas when argument is `false`', function(assert) {
    // when
    const areas = service.getAreas(false);

    // then
    assert.deepEqual(areas, [pixArea, pixFranceArea]);
  });

  test('it should return areas of set framework when have no argument ', async function(assert) {
    // when
    const areas = service.getAreas();
    // then
    assert.deepEqual(areas, [pixArea]);
  });

  test('it should return competence', function(assert) {
    // when
    const competenceResult = service.getCompetence();

    // then
    assert.deepEqual(competenceResult, competence);
  });

  test('it should return prototype', function(assert) {
    // when
    const prototypeResult = service.getPrototype();

    // then
    assert.deepEqual(prototypeResult, prototype);
  });

  test('it should return `true` if is a pix framework', function(assert) {
    // when
    const isPixFrameworkResult = service.isPixFramework;

    // then
    assert.ok(isPixFrameworkResult);
  });

  test('it should return `false` if is not a pix framework', function(assert) {
    // given
    service.setFramework(pixFranceFramework);

    // when
    const isPixFrameworkResult = service.isPixFramework;

    // then
    assert.notOk(isPixFrameworkResult);
  });
});

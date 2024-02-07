import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | current-data', function(hooks) {
  setupTest(hooks);
  let competence, service, pixFramework, pixFranceFramework, pix1dFramework, pixArea, pix1dArea, pixFranceArea, pix1dThematic, pix1dCompetence, prototype;

  hooks.beforeEach(function() {
    const store = this.owner.lookup('service:store');

    // Given
    prototype = store.createRecord('challenge',{
      id: 'prototype'
    });

    competence = store.createRecord('competence',{
      id: 'competence'
    });

    pix1dThematic = store.createRecord('theme',{
      id: 'thematic'
    });

    pix1dCompetence = store.createRecord('competence',{
      id: 'pix1dCompetence',
      rawThemes: [pix1dThematic]
    });

    pixFranceArea = store.createRecord('area',{
      id: 'pixFranceArea',
      code: '1',
    });

    pixArea = store.createRecord('area',{
      id: 'pixArea',
      code: '2',
    });

    pix1dArea = store.createRecord('area',{
      id: 'pix1dArea',
      code: '3',
      competences: [pix1dCompetence]
    });

    pixFranceFramework = store.createRecord('framework', {
      id: 'pixFranceFramework',
      name: 'France',
      areas: [pixFranceArea]
    });

    pixFramework = store.createRecord('framework', {
      id: 'pixFramework',
      name: 'Pix',
      areas: [pixArea]
    });

    pix1dFramework = store.createRecord('framework', {
      id: 'pix1dFramework',
      name: 'Pix 1D',
      areas: [pix1dArea]
    });

    service = this.owner.lookup('service:current-data');
    service.setFrameworks([pixFramework, pixFranceFramework, pix1dFramework]);
    service.setFramework(pixFramework);
    service.setAreas([pixArea, pixFranceArea, pix1dArea]);
    service.setCompetence(competence);
    service.setPrototype(prototype);
  });

  test('it should return frameworks', function(assert) {
    // when
    const frameworks = service.getFrameworks();

    // then
    assert.deepEqual(frameworks, [pixFramework, pixFranceFramework, pix1dFramework]);
  });

  test('it should return one framework', function(assert) {
    // when
    const framework = service.getFramework();

    // then
    assert.deepEqual(framework, pixFramework);
  });

  test('it should return all areas when argument is `false`', function(assert) {
    // when
    const areas = service.getAreas(false);

    // then
    assert.deepEqual(areas, [pixArea, pixFranceArea, pix1dArea]);
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

  test('it should return competences for pix1d', async function(assert) {
    // when
    const competencesResult = await service.getCompetencesFromPix1DFramework();

    // then
    assert.deepEqual(competencesResult, [pix1dCompetence]);
  });

  test('it should return thematics for pix1d', async function(assert) {
    // when
    const thematicsResult = await service.getThematicsFromPix1DFramework();

    // then
    assert.deepEqual(thematicsResult, [pix1dThematic]);
  });
});

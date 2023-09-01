import { expect, domainBuilder } from '../../../test-helper.js';

describe('Unit | chai-custom-helpers | deepEqualArray', function() {
  it('should fail assertion when compared objects are not arrays', function() {
    global.chaiErr(function() {
      expect([]).to.deepEqualArray('coucou');
    }, 'expected \'coucou\' to be an instance of Array');
    global.chaiErr(function() {
      const foo = 'bar';
      expect(foo).to.deepEqualArray([]);
    }, 'expected \'bar\' to be an instance of Array');
  });

  it('should fail assertion when compared arrays have not the same length', function() {
    global.chaiErr(function() {
      expect([1, 2, 3]).to.deepEqualArray([1, 2]);
    }, 'expected 3 to equal 2');
  });

  it('should fail assertion when compared values of array are not of the same instance', function() {
    global.chaiErr(function() {
      expect([1]).to.deepEqualArray(['coucou']);
    }, 'expected \'Number\' to equal \'String\'');
    global.chaiErr(function() {
      expect([domainBuilder.buildAreaForRelease()]).to.deepEqualArray([domainBuilder.buildCompetenceForRelease()]);
    }, 'expected \'AreaForRelease\' to equal \'CompetenceForRelease\'');
  });

  it('should fail assertion when compared values of array have not the same content', function() {
    global.chaiErr(function() {
      expect([1]).to.deepEqualArray([3]);
    }, 'expected 1 to deeply equal 3');
  });

  it('should succeed assertion when compared arrays have the same values in order', function() {
    // given
    const area = domainBuilder.buildAreaForRelease({
      id:'recArea1',
      name: 'nameArea1',
      code: 'codeArea1',
      color: 'colorArea1',
      competenceIds: ['recComp1', 'recComp2'],
      competenceAirtableIds: ['recAirComp1', 'recAirComp2'],
      frameworkId: 'recFramework1',
      titleFrFr: 'titreArea1',
      titleEnUs: 'titleArea1',
    });
    const sameArea = domainBuilder.buildAreaForRelease({
      id:'recArea1',
      name: 'nameArea1',
      code: 'codeArea1',
      color: 'colorArea1',
      competenceIds: ['recComp1', 'recComp2'],
      competenceAirtableIds: ['recAirComp1', 'recAirComp2'],
      frameworkId: 'recFramework1',
      titleFrFr: 'titreArea1',
      titleEnUs: 'titleArea1',
    });
    const competence = domainBuilder.buildCompetenceForRelease();

    // then
    expect([area, competence]).to.deepEqualArray([sameArea, competence]);
  });
});

const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | chai-custom-helpers | deepEqualInstanceOmitting', function() {
  it('should fail assertion when both objects are not of the same instance', function() {
    // given
    const area = domainBuilder.buildAreaForRelease();
    const competence = domainBuilder.buildCompetenceForRelease();
    const areaDTO = { ...area };

    // when / then
    global.chaiErr(function() {
      expect(competence).to.deepEqualInstanceOmitting(area);
    }, 'expected \'CompetenceForRelease\' to equal \'AreaForRelease\'');
    global.chaiErr(function() {
      expect(areaDTO).to.deepEqualInstanceOmitting(area);
    }, 'expected \'Object\' to equal \'AreaForRelease\'');
  });

  it('should fail assertion when both objects have not the same content', function() {
    // given
    const area = domainBuilder.buildAreaForRelease({
      id: 123,
      name: 'someName',
      competenceIds: ['recABC', 'recDEF'],
    });
    const otherArea = domainBuilder.buildAreaForRelease({
      id: 124,
      name: 'someName',
      competenceIds: ['recABC', 'recDEF'],
    });
    const anotherArea = domainBuilder.buildAreaForRelease({
      id: 123,
      name: 'name',
      competenceIds: ['recUVW', 'recXYZ'],
    });

    // when/then
    global.chaiErr(
      function() {
        expect(otherArea).to.deepEqualInstanceOmitting(area);
      },
      {
        actual: otherArea,
        expected: area,
        operator: 'deepStrictEqual',
      }
    );
    global.chaiErr(
      function() {
        expect(anotherArea).to.deepEqualInstanceOmitting(area);
      },
      {
        actual: anotherArea,
        expected: area,
        operator: 'deepStrictEqual',
      }
    );
  });

  it('should succeed assertion when both objects have the same type and content, regardless of the reference', function() {
    // given
    const area = domainBuilder.buildAreaForRelease({
      id: 124,
      name: 'someName',
      competenceIds: ['recABC', 'recDEF'],
    });
    const sameArea = domainBuilder.buildAreaForRelease({
      id: 124,
      name: 'someName',
      competenceIds: ['recABC', 'recDEF'],
    });

    // then
    expect(area).to.deepEqualInstanceOmitting(area);
    expect(area).to.deepEqualInstanceOmitting(sameArea);
  });

  it('should succeed assertion when both objects have the same type and partial content', function() {
    // given
    const area = domainBuilder.buildAreaForRelease({
      id: 123,
      name: 'someName',
      competenceIds: ['recABC', 'recDEF'],
    });
    const areaDifferentId = domainBuilder.buildAreaForRelease({
      id: 456,
      name: 'someName',
      competenceIds: ['recABC', 'recDEF'],
    });

    // then
    expect(area).to.deepEqualInstanceOmitting(areaDifferentId, ['id']);
  });
});

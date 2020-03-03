const { expect, sinon } = require('../../../test-helper');
const areaDatasource = require('../../../../lib/infrastructure/datasources/airtable/area-datasource');
const competenceDatasource = require('../../../../lib/infrastructure/datasources/airtable/competence-datasource');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');

describe('Unit | Repository | competence-repository', () => {

  const areaData = {
    id: 'recArea',
    code: '1',
    name: 'Area name',
    title: 'Information et données',
    color: 'jaffa',
    competenceIds: ['recCompetence1', 'recCompetence2'],
  };

  const competenceData1 = {
    id: 'recCompetence1',
    name: 'Mener une recherche d’information',
    index: '1.1',
    description: 'Competence description 1',
    areaId: 'recArea',
    origin: 'Pix',
    skillIds: ['recSkill1', 'recSkill2'],
  };

  const competenceData2 = {
    id: 'recCompetence2',
    name: 'CompetenceName2',
    index: '1.2',
    description: 'Competence description 2',
    areaId: 'recArea',
    origin: 'Pix',
    skillIds: [],
  };

  beforeEach(() => {
    sinon.stub(areaDatasource, 'list').resolves([areaData]);
    sinon.stub(competenceDatasource, 'list').resolves([competenceData2, competenceData1]);
  });

  describe('#list', () => {

    it('should return domain Competence objects sorted by index', () => {
      // when
      const fetchedCompetences = competenceRepository.list();

      // then
      return fetchedCompetences.then((competences) => {
        expect(competences).to.have.lengthOf(2);
        expect(competences[0].index).to.equal('1.1');
        expect(competences[1].index).to.equal('1.2');
      });
    });
  });

});

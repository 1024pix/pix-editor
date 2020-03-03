const { expect, sinon, domainBuilder } = require('../../../test-helper');
const areaDatasource = require('../../../../lib/infrastructure/datasources/airtable/area-datasource');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const areaRepository = require('../../../../lib/infrastructure/repositories/area-repository');

describe('Unit | Repository | area-repository', function() {
  const area1 = {
    id: 'recDomaine1',
    name: '1. Domaine 1',
    code: '1',
    title: 'Domaine 1',
    color: 'emerald',
  };
  const area2 = {
    id: 'recDomaine2',
    name: '2. Domaine 2',
    code: '2',
    title: 'Domaine 2',
    color: 'wild-strawberry',
  };

  beforeEach(() => {
    sinon.stub(areaDatasource, 'list');
    sinon.stub(competenceRepository, 'list');

    areaDatasource.list.resolves([
      domainBuilder.buildAreaAirtableDataObject({
        id: 'recDomaine1',
        code: '1',
        title: 'Domaine 1',
        name: '1. Domaine 1',
        color: 'emerald',
      }),
      domainBuilder.buildAreaAirtableDataObject({
        id: 'recDomaine2',
        code: '2',
        title: 'Domaine 2',
        name: '2. Domaine 2',
        color: 'wild-strawberry',
      }),
    ]);

    competenceRepository.list.resolves([
      domainBuilder.buildCompetence({
        id: 'recsvLz0W2ShyfD63',
        name: 'Mener une recherche et une veille d’information',
        index: '1.1',
        description: '1.1 - Mener une recherche et une veille d’information',
        area: area1
      }),
      domainBuilder.buildCompetence({
        id: 'recDH19F7kKrfL3Ii',
        name: 'Interagir',
        index: '2.1',
        description: '2.1 - Interagir',
        area: area2
      }),
    ]);
  });

  describe('#list', () => {

    it('should fetch all area records from Airtable "Domaines" table', () => {
      // when
      const fetchedAreas = areaRepository.list();

      // then
      return fetchedAreas.then(() => {
        expect(areaDatasource.list).to.have.been.called;
      });
    });

    it('should return domain Area objects', async () => {
      // given
      const expectedAreas = [{
        id: 'recDomaine1',
        name: '1. Domaine 1',
        code: '1',
        title: 'Domaine 1',
        color: 'emerald',
        competences: [{
          area: area1,
          id: 'recsvLz0W2ShyfD63',
          name: 'Mener une recherche et une veille d’information',
          index: '1.1',
          description: '1.1 - Mener une recherche et une veille d’information',
          origin: 'Pix',
          skills: []
        }]
      }, {
        id: 'recDomaine2',
        name: '2. Domaine 2',
        code: '2',
        title: 'Domaine 2',
        color: 'wild-strawberry',
        competences: [{
          area: area2,
          id: 'recDH19F7kKrfL3Ii',
          name: 'Interagir',
          index: '2.1',
          description: '2.1 - Interagir',
          origin: 'Pix',
          skills: []
        }]
      }];

      // when
      const fetchedAreas = await areaRepository.list();

      // then
      expect(fetchedAreas).to.deep.equal(expectedAreas);
    });
  });
});

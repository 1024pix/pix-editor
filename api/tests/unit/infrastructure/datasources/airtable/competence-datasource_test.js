const { expect, domainBuilder, airtableBuilder } = require('../../../../test-helper');
const competenceDatasource = require('../../../../../lib/infrastructure/datasources/airtable/competence-datasource');
const AirtableRecord = require('airtable').Record;

describe('Unit | Infrastructure | Datasource | Airtable | CompetenceDatasource', () => {

  describe('#fromAirTableObject', () => {

    it('should create a Competence from the AirtableRecord', () => {
      // given
      const expectedCompetence = domainBuilder.buildCompetence();
      const airtableCompetence = airtableBuilder.factory.buildCompetence(expectedCompetence);
      const competenceRecord = new AirtableRecord('Competence', airtableCompetence.id, airtableCompetence);

      // when
      const area = competenceDatasource.fromAirTableObject(competenceRecord);

      // then
      expect(area).to.deep.equal(expectedCompetence);
    });
  });

});

import { expect, domainBuilder, airtableBuilder } from '../../../../test-helper.js';
import { competenceDatasource } from '../../../../../lib/infrastructure/datasources/airtable/competence-datasource.js';
import airtable from 'airtable';

const { Record: AirtableRecord } = airtable;

describe('Unit | Infrastructure | Datasource | Airtable | CompetenceDatasource', () => {

  describe('#fromAirTableObject', () => {

    it('should create a Competence from the AirtableRecord', () => {
      // given
      const expectedCompetence = domainBuilder.buildCompetenceDatasourceObject();
      const airtableCompetence = airtableBuilder.factory.buildCompetence(expectedCompetence);
      const competenceRecord = new AirtableRecord('Competence', airtableCompetence.id, airtableCompetence);

      // when
      const area = competenceDatasource.fromAirTableObject(competenceRecord);

      // then
      expect(area).to.deep.equal(expectedCompetence);
    });
  });

});

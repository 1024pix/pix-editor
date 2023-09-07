const { expect, domainBuilder } = require('../../../test-helper');
const { filterCompetencesFields } = require('../../../../lib/infrastructure/transformers/competence-transformer');

describe('Unit | Infrastructure | competence-transformer', function() {

  it('should only keep useful fields', function() {
    const airtableCompetences = [domainBuilder.buildCompetenceDatasourceObject()];

    const competences = filterCompetencesFields(airtableCompetences);

    expect(competences.length).to.equal(1);
  });
});

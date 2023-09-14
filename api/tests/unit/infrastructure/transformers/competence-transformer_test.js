import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { filterCompetencesFields } from '../../../../lib/infrastructure/transformers/competence-transformer.js';

describe('Unit | Infrastructure | competence-transformer', function() {

  it('should only keep useful fields', function() {
    const airtableCompetences = [domainBuilder.buildCompetenceDatasourceObject()];

    const competences = filterCompetencesFields(airtableCompetences);

    expect(competences.length).to.equal(1);
  });
});

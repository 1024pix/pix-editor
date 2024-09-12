import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { filterThematicsFields } from '../../../../lib/infrastructure/transformers/thematic-transformer.js';

describe('Unit | Infrastructure | thematic-transformer', function() {

  it('should only keep useful fields', function() {
    const thematics = [domainBuilder.buildThematic()];

    const filteredThematics = filterThematicsFields(thematics);

    expect(filteredThematics.length).to.equal(1);
    expect(filteredThematics[0].id).to.exist;
    expect(filteredThematics[0].name_i18n).to.exist;
    expect(filteredThematics[0].index).to.exist;
    expect(filteredThematics[0].competenceId).to.exist;
    expect(filteredThematics[0].tubeIds).to.exist;
    expect(filteredThematics[0].airtableId).to.not.exist;
  });
});

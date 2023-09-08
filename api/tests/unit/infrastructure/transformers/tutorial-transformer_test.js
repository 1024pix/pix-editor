import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { filterTutorialsFields } from '../../../../lib/infrastructure/transformers/tutorial-transformer.js';

describe('Unit | Infrastructure | tutorial-transformer', function() {

  it('should only keep useful fields', function() {
    const airtableTutorials = [domainBuilder.buildTutorialDatasourceObject()];

    const tutorials = filterTutorialsFields(airtableTutorials);

    expect(tutorials.length).to.equal(1);
    expect(tutorials[0].duration).to.exist;
    expect(tutorials[0].tutorialForSkills).to.not.exist;
    expect(tutorials[0].furtherInformation).to.not.exist;
  });
});

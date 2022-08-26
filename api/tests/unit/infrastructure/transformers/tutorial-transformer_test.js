const { expect, domainBuilder } = require('../../../test-helper');
const { filterTutorialsFields } = require('../../../../lib/infrastructure/transformers/tutorial-transformer');

describe('Unit | Infrastructure | tutorial-transformer', function() {

  it('should only keep useful fields', function() {
    const airtableTutorials = [domainBuilder.buildTutorialAirtableDataObject()];

    const tutorials = filterTutorialsFields(airtableTutorials);

    expect(tutorials.length).to.equal(1);
    expect(tutorials[0].duration).to.exist;
    expect(tutorials[0].tutorialForSkills).to.not.exist;
    expect(tutorials[0].furtherInformation).to.not.exist;
  });
});

const { expect, domainBuilder } = require('../../../test-helper');
const Content = require('../../../../lib/domain/models/Content');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Competence = require('../../../../lib/domain/models/Competence');
const Course = require('../../../../lib/domain/models/Course');
const Skill = require('../../../../lib/domain/models/Skill');
const Tube = require('../../../../lib/domain/models/Tube');
const Tutorial = require('../../../../lib/domain/models/Tutorial');

describe('Unit | Domain | Content', () => {
  describe('#from', () => {
    let data;
    beforeEach(function() {
      const areaAirtable = domainBuilder.buildAreaAirtableDataObject({
        id: 'recAreaA',
        code: 'codeAreaA',
        name: 'nameAreaA',
        color: 'colorAreaA',
        titleFrFr: 'Information et données',
        titleEnUs: 'Information and data',
        competenceIds: ['recCompA', 'recCompB'],
        competenceAirtableIds: ['recAirCompA', 'recAirCompB'],
        frameworkId: 'recFrameworkA',
      });
      data = {
        areas: [areaAirtable],
        challenges: [{ id: 123 }],
        competences: [{ id: 123, name: 'nom', nameFrFr: 'nom', nameEnUs: 'name',  description: 'description fr', descriptionFrFr: 'description fr', descriptionEnUs: 'description en' }],
        courses: [{ id: 123 }],
        skills: [{ id: 123, hintFrFr: 'indice', hintEnUs: 'hint' }],
        tubes: [{ id: 123, practicalTitleFrFr: 'titre pratique', practicalTitleEnUs: 'practical title', practicalDescriptionFrFr: 'description pratique', practicalDescriptionEnUs: 'practical description' }],
        tutorials: [{ id: 123 }],
      };
    });

    it('should return a Content model', function() {
      const content = Content.from({});

      expect(content).to.be.instanceOf(Content);
    });

    it('should return a Content model with models as attributes', function() {
      const content = Content.from(data);

      const expectedArea = domainBuilder.buildArea({
        id: 'recAreaA',
        code: 'codeAreaA',
        name: 'nameAreaA',
        color: 'colorAreaA',
        titleFrFr: 'Information et données',
        titleEnUs: 'Information and data',
        competenceIds: ['recCompA', 'recCompB'],
        competenceAirtableIds: ['recAirCompA', 'recAirCompB'],
        frameworkId: 'recFrameworkA',
      });
      expect(content.areas).to.deep.equal([expectedArea]);
      expect(content.challenges[0]).to.be.instanceOf(Challenge);
      expect(content.competences[0]).to.be.instanceOf(Competence);
      expect(content.courses[0]).to.be.instanceOf(Course);
      expect(content.skills[0]).to.be.instanceOf(Skill);
      expect(content.tubes[0]).to.be.instanceOf(Tube);
      expect(content.tutorials[0]).to.be.instanceOf(Tutorial);
    });
  });
});

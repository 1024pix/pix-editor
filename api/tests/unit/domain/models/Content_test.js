const { expect, domainBuilder } = require('../../../test-helper');
const Content = require('../../../../lib/domain/models/Content');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Competence = require('../../../../lib/domain/models/Competence');
const Course = require('../../../../lib/domain/models/Course');
const Skill = require('../../../../lib/domain/models/Skill');
const Tube = require('../../../../lib/domain/models/Tube');
const Tutorial = require('../../../../lib/domain/models/Tutorial');
const Training = require('../../../../lib/domain/models/Training');

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
        trainings: [{ id: 345 }],
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
        locale: null,
      });
      expect(content.areas).to.deep.equal([expectedArea]);
      expect(content.challenges[0]).to.be.instanceOf(Challenge);
      expect(content.competences[0]).to.be.instanceOf(Competence);
      expect(content.courses[0]).to.be.instanceOf(Course);
      expect(content.skills[0]).to.be.instanceOf(Skill);
      expect(content.tubes[0]).to.be.instanceOf(Tube);
      expect(content.tutorials[0]).to.be.instanceOf(Tutorial);
      expect(content.trainings[0]).to.be.instanceOf(Training);
    });

    it('should return a version for locale "fr-fr"', function() {
      const content = Content.from(data);

      const expectedAreaFrFr = domainBuilder.buildArea.withLocaleFrFr({
        id: 'recAreaA',
        code: 'codeAreaA',
        name: 'nameAreaA',
        color: 'colorAreaA',
        title: 'Information et données',
        competenceIds: ['recCompA', 'recCompB'],
        competenceAirtableIds: ['recAirCompA', 'recAirCompB'],
        frameworkId: 'recFrameworkA',
      });
      const expectedContent = {
        areas: [expectedAreaFrFr],
        challenges: [{ id: 123 }],
        competences: [{ id: 123, name: 'nom', nameFrFr: 'nom', description: 'description fr', descriptionFrFr: 'description fr' }],
        courses: [{ id: 123 }],
        skills: [{ id: 123, hint: 'indice', hintFrFr: 'indice' }],
        tubes: [{ id: 123, practicalTitleFrFr: 'titre pratique', practicalTitle: 'titre pratique', practicalDescriptionFrFr: 'description pratique',  practicalDescription: 'description pratique' }],
        tutorials: [{ id: 123 }],
        trainings: [{ id: 345 }],
      };
      expect(content['fr-fr']).to.shallowDeepEqual(expectedContent);
    });

    it('should return a version for locale "en"', function() {
      const content = Content.from(data);

      const expectedAreaEnUs = domainBuilder.buildArea.withLocaleEnUs({
        id: 'recAreaA',
        code: 'codeAreaA',
        name: 'nameAreaA',
        color: 'colorAreaA',
        title: 'Information and data',
        competenceIds: ['recCompA', 'recCompB'],
        competenceAirtableIds: ['recAirCompA', 'recAirCompB'],
        frameworkId: 'recFrameworkA',
      });
      const expectedContent = {
        areas: [expectedAreaEnUs],
        challenges: [{ id: 123 }],
        competences: [{ id: 123, name: 'name', nameEnUs: 'name', description: 'description en', descriptionEnUs: 'description en' }],
        courses: [{ id: 123 }],
        skills: [{ id: 123, hint: 'hint', hintEnUs: 'hint' }],
        tubes: [{ id: 123, practicalTitleEnUs: 'practical title', practicalTitle: 'practical title', practicalDescriptionEnUs: 'practical description',  practicalDescription: 'practical description' }],
        tutorials: [{ id: 123 }],
        trainings: [{ id: 345 }],
      };
      expect(content['en']).to.shallowDeepEqual(expectedContent);
    });

    it('should return a version for locale "fr"', function() {
      const content = Content.from(data);

      const expectedAreaFr = domainBuilder.buildArea.withLocaleFr({
        id: 'recAreaA',
        code: 'codeAreaA',
        name: 'nameAreaA',
        color: 'colorAreaA',
        title: 'Information et données',
        competenceIds: ['recCompA', 'recCompB'],
        competenceAirtableIds: ['recAirCompA', 'recAirCompB'],
        frameworkId: 'recFrameworkA',
      });
      const expectedContent = {
        areas: [expectedAreaFr],
        challenges: [{ id: 123 }],
        competences: [{ id: 123, name: 'nom', nameFrFr: 'nom', description: 'description fr', descriptionFrFr: 'description fr' }],
        courses: [{ id: 123 }],
        skills: [{ id: 123, hint: 'indice', hintFrFr: 'indice' }],
        tubes: [{ id: 123, practicalTitleFrFr: 'titre pratique', practicalTitle: 'titre pratique', practicalDescriptionFrFr: 'description pratique',  practicalDescription: 'description pratique' }],
        tutorials: [{ id: 123 }],
        trainings: [{ id: 345 }],
      };
      expect(content['fr']).to.shallowDeepEqual(expectedContent);
    });
  });
});

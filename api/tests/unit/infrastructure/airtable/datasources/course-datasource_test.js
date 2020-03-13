const AirtableRecord = require('airtable').Record;
const { expect  } = require('../../../../test-helper');
const courseDatasource = require('../../../../../lib/infrastructure/datasources/airtable/course-datasource');

describe('Unit | Infrastructure | Datasource | Airtable | CourseDatasource', () => {
  describe('#fromAirTableObject', () => {

    it('should create a Course from the AirtableRecord (challenges should be reversed in order to match the order in the UI)', () => {
      // given
      const airtableRecord = new AirtableRecord('Course', 'recCourse123', {
        'id': 'recCourse123',
        'fields': {
          'id persistant': 'recCourse123',
          'Nom': 'course-name',
          'Description': 'course-description',
          'Adaptatif ?': false,
          'Épreuves (id persistant)': [
            'recChallenge1',
            'recChallenge2',
          ],
          'Competence (id persistant)': ['recCompetence123'],
          'Image': [
            {
              'url': 'https://example.org/course.png',
            }
          ],
        },
      });

      // when
      const course = courseDatasource.fromAirTableObject(airtableRecord);

      // then
      const expectedCourse = {
        id: 'recCourse123',
        name: 'course-name',
        adaptive: false,

        competences: ['recCompetence123'],
        description: 'course-description',
        imageUrl: 'https://example.org/course.png',

        challenges: ['recChallenge2', 'recChallenge1'],
      };

      expect(course).to.deep.equal(expectedCourse);
    });
  });

});

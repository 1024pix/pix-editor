const { expect, databaseBuilder } = require('../../../test-helper');
const trainingRepository = require('../../../../lib/infrastructure/repositories/training-repository');
const Training = require('../../../../lib/domain/models/Training');

describe('Integration | Repository | training-repository', function() {
  describe('#list', () => {
    let training1;
    let training2;

    beforeEach(async () => {
      training1 = databaseBuilder.factory.buildTraining({
        title: 'Travail de groupe et collaboration entre les personnels',
        link: 'https://magistere.education.fr/ac-normandie/enrol/index.php?id=5924',
        type: 'autoformation',
        duration: '06:00:00',
        locale: 'fr-fr',
        targetProfileIds: [1822, 2214],
      });

      training2 = databaseBuilder.factory.buildTraining({
        title: 'Moodle : Partager et échanger ses ressources',
        link: 'https://tube-strasbourg.beta.education.fr/videos/watch/7df08eb6-603e-46a8-9be3-a34092fe7e68',
        type: 'webinaire',
        duration: '01:00:00',
        locale: 'fr-fr',
        targetProfileIds: [1777],
      });
      await databaseBuilder.commit();
    });

    it('should list all trainings', async () => {
      // Given
      training1.duration = { hours: 6 };
      training2.duration = { hours: 1 };

      const expectedTrainings = [new Training(training1), new Training(training2)];

      // When
      const trainings = await trainingRepository.list();

      // Then
      expect(trainings).to.have.length(2);
      expect(trainings[0]).to.be.instanceOf(Training);
      expect(trainings[0].id).to.equal(expectedTrainings[0].id);
      expect(trainings[0].title).to.equal(expectedTrainings[0].title);
      expect(trainings[0].link).to.equal(expectedTrainings[0].link);
      expect(trainings[0].type).to.equal(expectedTrainings[0].type);
      expect(trainings[0].duration.hours).to.equal(training1.duration.hours);
      expect(trainings[0].locale).to.equal(expectedTrainings[0].locale);
      expect(trainings[0].targetProfileIds).to.deep.equal(expectedTrainings[0].targetProfileIds);
      expect(trainings[0].createdAt).to.deep.equal(expectedTrainings[0].createdAt);
      expect(trainings[0].updatedAt).to.deep.equal(expectedTrainings[0].updatedAt);
    });
  });
});

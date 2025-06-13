import { describe, describe as context, expect, it } from 'vitest';
import { forRelease, forReplication } from '../../../../lib/infrastructure/transformers/tutorial-transformer.js';
import { Tutorial } from '../../../../lib/domain/models/index.js';
import { TutorialForRelease } from '../../../../lib/domain/models/release/index.js';
import { TutorialForReplication } from '../../../../lib/domain/models/replication/index.js';

describe('Unit | Infrastructure | tutorial-transformer', function() {
  
  describe('#forRelease', function() {
    context('when providing a single Tutorial', function() {
      it('should transform it into a single TutorialForRelease', function() {
        // given
        const tutorial = new Tutorial({
          id: 'tutorialABC123',
          airtableId: 'recABC123',
          title: 'Titre de mon tuto',
          duration: '00:10:05',
          source: 'MonGrenier',
          format: Tutorial.FORMATS.FRISE,
          link: 'https://mongrenier.com',
          license: Tutorial.LICENSES.CCBYSA,
          level: Tutorial.LEVELS.ONE,
          crush: true,
          locale: 'fr',
          tagAirtableIds: ['recTag1', 'recTag2'],
        });

        // when
        const actualTutorialForRelease = forRelease(tutorial);

        // then
        expect(actualTutorialForRelease).toStrictEqual(new TutorialForRelease({
          id: 'tutorialABC123',
          duration: '00:10:05',
          format: Tutorial.FORMATS.FRISE,
          link: 'https://mongrenier.com',
          source: 'MonGrenier',
          title: 'Titre de mon tuto',
          locale: 'fr',
        }));
      });
    });

    context('when providing several Tutorials', function() {
      it('should transform them into a several TutorialsForRelease', function() {
        // given
        const tutorialA = new Tutorial({
          id: 'tutorialABC123',
          airtableId: 'recABC123',
          title: 'Titre de mon tuto A',
          duration: '00:10:05',
          source: 'MonGrenier',
          format: Tutorial.FORMATS.FRISE,
          link: 'https://mongrenier.com',
          license: Tutorial.LICENSES.CCBYSA,
          level: Tutorial.LEVELS.ONE,
          crush: true,
          locale: 'fr',
          tagAirtableIds: ['recTag1', 'recTag2'],
        });
        const tutorialB = new Tutorial({
          id: 'tutorialDEF456',
          airtableId: 'recDEF456',
          title: 'Titre de mon tuto B',
          duration: '00:58:21',
          source: 'MaCave',
          format: Tutorial.FORMATS.VIDEO,
          link: 'https://macave.com',
          license: Tutorial.LICENSES.C,
          level: Tutorial.LEVELS.TWO,
          crush: false,
          locale: 'nl',
          tagAirtableIds: ['recTag3', 'recTag4'],
        });

        // when
        const actualTutorialsForRelease = forRelease([tutorialA, tutorialB]);

        // then
        expect(actualTutorialsForRelease).toStrictEqual([
          new TutorialForRelease({
            id: 'tutorialABC123',
            duration: '00:10:05',
            format: Tutorial.FORMATS.FRISE,
            link: 'https://mongrenier.com',
            source: 'MonGrenier',
            title: 'Titre de mon tuto A',
            locale: 'fr',
          }),
          new TutorialForRelease({
            id: 'tutorialDEF456',
            duration: '00:58:21',
            format: Tutorial.FORMATS.VIDEO,
            link: 'https://macave.com',
            source: 'MaCave',
            title: 'Titre de mon tuto B',
            locale: 'nl',
          }),
        ]);
      });
    });
  });

  describe('#forReplication', function() {
    context('when providing a single Tutorial', function() {
      it('should transform it into a single TutorialForReplication', function() {
        // given
        const tutorial = new Tutorial({
          id: 'tutorialABC123',
          airtableId: 'recABC123',
          title: 'Titre de mon tuto',
          duration: '00:10:05',
          source: 'MonGrenier',
          format: Tutorial.FORMATS.FRISE,
          link: 'https://mongrenier.com',
          license: Tutorial.LICENSES.CCBYSA,
          level: Tutorial.LEVELS.ONE,
          crush: true,
          locale: 'fr',
          tagAirtableIds: ['recTag1', 'recTag2'],
        });

        // when
        const actualTutorialForReplication = forReplication(tutorial);

        // then
        expect(actualTutorialForReplication).toStrictEqual(new TutorialForReplication({
          id: 'tutorialABC123',
          duration: '00:10:05',
          format: Tutorial.FORMATS.FRISE,
          link: 'https://mongrenier.com',
          source: 'MonGrenier',
          title: 'Titre de mon tuto',
          locale: 'fr',
        }));
      });
    });

    context('when providing several Tutorials', function() {
      it('should transform them into a several TutorialsForReplication', function() {
        // given
        const tutorialA = new Tutorial({
          id: 'tutorialABC123',
          airtableId: 'recABC123',
          title: 'Titre de mon tuto A',
          duration: '00:10:05',
          source: 'MonGrenier',
          format: Tutorial.FORMATS.FRISE,
          link: 'https://mongrenier.com',
          license: Tutorial.LICENSES.CCBYSA,
          level: Tutorial.LEVELS.ONE,
          crush: true,
          locale: 'fr',
          tagAirtableIds: ['recTag1', 'recTag2'],
        });
        const tutorialB = new Tutorial({
          id: 'tutorialDEF456',
          airtableId: 'recDEF456',
          title: 'Titre de mon tuto B',
          duration: '00:58:21',
          source: 'MaCave',
          format: Tutorial.FORMATS.VIDEO,
          link: 'https://macave.com',
          license: Tutorial.LICENSES.C,
          level: Tutorial.LEVELS.TWO,
          crush: false,
          locale: 'nl',
          tagAirtableIds: ['recTag3', 'recTag4'],
        });

        // when
        const actualTutorialsForReplication = forReplication([tutorialA, tutorialB]);

        // then
        expect(actualTutorialsForReplication).toStrictEqual([
          new TutorialForReplication({
            id: 'tutorialABC123',
            duration: '00:10:05',
            format: Tutorial.FORMATS.FRISE,
            link: 'https://mongrenier.com',
            source: 'MonGrenier',
            title: 'Titre de mon tuto A',
            locale: 'fr',
          }),
          new TutorialForReplication({
            id: 'tutorialDEF456',
            duration: '00:58:21',
            format: Tutorial.FORMATS.VIDEO,
            link: 'https://macave.com',
            source: 'MaCave',
            title: 'Titre de mon tuto B',
            locale: 'nl',
          }),
        ]);
      });
    });
  });
});

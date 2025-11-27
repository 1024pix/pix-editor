import { describe, expect, it } from 'vitest';
import * as tutorialRepository from '../../../../lib/infrastructure/repositories/tutorial-repository.js';
import { Tutorial } from '../../../../lib/domain/models/Tutorial.js';
import { databaseBuilder, knex } from '../../../test-helper.js';

describe('Integration | Infrastructure | Repository | Tutorial', () => {
  describe('#getMany', () => {
    it('returns corresponding tutorials for given ids', async () => {
      // given
      const tutorials = [
        {
          id: 'tuto1',
          airtableId: 'recTuto1',
          duration: 'Durée 1',
          format: 'Format 1',
          link: 'Lien 1',
          source: 'Source 1',
          title: 'Titre 1',
          locale: 'Langue 1',
          license: 'License 1',
          level: 'niveau 1',
          crush: true,
          tagAirtableIds: ['recTag1', 'recTag2'],
          tagIds: ['tag1', 'tag2'],
        },
        {
          id: 'tuto2',
          airtableId: 'recTuto2',
          duration: 'Durée 2',
          format: 'Format 2',
          link: 'Lien 2',
          source: 'Source 2',
          title: 'Titre 2',
          locale: 'Langue 2',
          license: 'License 2',
          level: 'niveau 2',
          crush: false,
          tagAirtableIds: ['recTag2', 'recTag3'],
          tagIds: ['tag2', 'tag3'],
        },
      ];

      databaseBuilder.factory.buildTag({ id: 'tag1', title: 'tag 1' });
      databaseBuilder.factory.buildTag({ id: 'tag2', title: 'tag 2' });
      databaseBuilder.factory.buildTag({ id: 'tag3', title: 'tag 3' });
      tutorials.forEach(databaseBuilder.factory.buildTutorial);
      await databaseBuilder.commit();

      // when
      const actualTutorials = await tutorialRepository.getMany(['tuto1', 'tuto2']);

      // then
      expect(actualTutorials).toStrictEqual([
        new Tutorial({
          airtableId: 'tuto1',
          id: 'tuto1',
          duration: 'Durée 1',
          format: 'Format 1',
          link: 'Lien 1',
          source: 'Source 1',
          title: 'Titre 1',
          locale: 'Langue 1',
          license: 'License 1',
          level: 'niveau 1',
          crush: true,
          tagAirtableIds: ['tag1', 'tag2'],
          tagIds: ['tag1', 'tag2'],
        }),
        new Tutorial({
          airtableId: 'tuto2',
          id: 'tuto2',
          duration: 'Durée 2',
          format: 'Format 2',
          link: 'Lien 2',
          source: 'Source 2',
          title: 'Titre 2',
          locale: 'Langue 2',
          license: 'License 2',
          level: 'niveau 2',
          crush: false,
          tagAirtableIds: ['tag2', 'tag3'],
          tagIds: ['tag2', 'tag3'],
        }),
      ]);
    });
  });

  describe('#delete', () => {
    it('deletes records corresponding to given ids', async () => {
      // given
      const tutorials = [
        {
          airtableId: 'recTuto1',
          id: 'tuto1',
          title: 'title 1',
          duration: 'duration 1',
          source: 'source 1',
          format: 'format 1',
          link: 'link 1',
          locale: 'locale 1',
          tagIds: ['tag1', 'tag2'],
        },
        {
          airtableId: 'recTuto2',
          id: 'tuto2',
          title: 'title 2',
          duration: 'duration 2',
          source: 'source 2',
          format: 'format 2',
          link: 'link 2',
          locale: 'locale 2',
          tagIds: ['tag2', 'tag3'],
        },
      ];

      databaseBuilder.factory.buildTag({ id: 'tag1', title: 'tag 1' });
      databaseBuilder.factory.buildTag({ id: 'tag2', title: 'tag 2' });
      databaseBuilder.factory.buildTag({ id: 'tag3', title: 'tag 3' });
      tutorials.forEach(databaseBuilder.factory.buildTutorial);
      databaseBuilder.factory.buildTutorial({
        airtableId: 'recTuto3',
        id: 'tuto3',
        title: 'title 3',
        duration: 'duration 3',
        source: 'source 3',
        format: 'format 3',
        link: 'link 3',
        locale: 'locale 3',
        tagIds: ['tag1', 'tag3'],
      });
      await databaseBuilder.commit();

      // when
      await tutorialRepository.delete(['tuto1', 'tuto2']);

      // then
      await expect(knex.select('*').from('tutorials').orderBy('id')).resolves.toStrictEqual([
        {
          id: 'tuto3',
          title: 'title 3',
          duration: 'duration 3',
          source: 'source 3',
          format: 'format 3',
          link: 'link 3',
          locale: 'locale 3',
          crush: false,
          level: null,
          license: null,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      ]);

      await expect(
        knex.select('*').from('tutorials-tutorial_tags').orderBy(['tutorialId', 'tutorialTagId']),
      ).resolves.toStrictEqual([{ tutorialId: 'tuto3', tutorialTagId: 'tag1', createdAt: expect.any(Date), updatedAt: expect.any(Date) }, { tutorialId: 'tuto3', tutorialTagId: 'tag3', createdAt: expect.any(Date), updatedAt: expect.any(Date) }]);
    });
  });

  describe('#create', () => {
    describe('when tutorial has no tags', () => {
      it('saves tutorial and returns it with empty tag ids', async () => {
        // given
        const tutorial = new Tutorial({
          title: 'Tuto Nico',
          locale: 'fr',
          link: 'https://example.com',
          source: 'Example',
          format: Tutorial.FORMATS.SITE,
          duration: '00:03:00',
        });

        // when
        const createdTutorial = await tutorialRepository.create(tutorial);

        // then
        expect(createdTutorial).toStrictEqual(new Tutorial({
          id: expect.stringMatching(/^tutorial.+$/),
          airtableId: expect.stringMatching(/^tutorial.+$/),
          title: 'Tuto Nico',
          locale: 'fr',
          link: 'https://example.com',
          source: 'Example',
          format: Tutorial.FORMATS.SITE,
          duration: '00:03:00',
          tagAirtableIds: [],
          tagIds: [],
          crush: false,
          level: null,
          license: null,
        }));
      });
    });
  });
});

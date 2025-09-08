import { describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';
import * as airtable from '../../../../lib/infrastructure/airtable.js';
import * as tutorialRepository from '../../../../lib/infrastructure/repositories/tutorial-repository.js';
import { Tutorial } from '../../../../lib/domain/models/Tutorial.js';
import { tutorialDatasource } from '../../../../lib/infrastructure/datasources/airtable/tutorial-datasource.js';

const AIRTABLE_NAME = 'Tutoriels';

describe('Integration | Infrastructure | Repository | Tutorial', () => {
  describe('#getMany', () => {
    it('returns corresponding tutorials for given ids', async () => {
      // given
      const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
        new Airtable.Record(AIRTABLE_NAME, 'recTuto1', {
          fields: {
            'id persistant': 'tuto1',
            Durée: 'Durée 1',
            Format: 'Format 1',
            Lien: 'Lien 1',
            Source: 'Source 1',
            Titre: 'Titre 1',
            Langue: 'Langue 1',
            License: 'License 1',
            niveau: 'niveau 1',
            CoupDeCoeur: 'YES',
            Tags: ['recTag1', 'recTag2'],
            'Solution à': ['recSkill1', 'recSkill2'],
            'En savoir plus': ['recSkill1', 'recSkill3'],
          },
        }),
        new Airtable.Record(AIRTABLE_NAME, 'recTuto2', {
          fields: {
            'id persistant': 'tuto2',
            Durée: 'Durée 2',
            Format: 'Format 2',
            Lien: 'Lien 2',
            Source: 'Source 2',
            Titre: 'Titre 2',
            Langue: 'Langue 2',
            License: 'License 2',
            niveau: 'niveau 2',
            CoupDeCoeur: 'NON',
            Tags: ['recTag2', 'recTag3'],
          },
        }),
      ]);

      // when
      const tutorials = await tutorialRepository.getMany(['tuto1', 'tuto2']);

      // then
      expect(tutorials).toStrictEqual([
        new Tutorial({
          airtableId: 'recTuto1',
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
          tagAirtableIds: ['recTag1', 'recTag2'],
        }),
        new Tutorial({
          airtableId: 'recTuto2',
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
          tagAirtableIds: ['recTag2', 'recTag3'],
        }),
      ]);

      expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, {
        fields: tutorialDatasource.usedFields,
        filterByFormula: 'OR("tuto1" = {id persistant},"tuto2" = {id persistant})',
      });
    });
  });

  describe('#delete', () => {
    it('deletes records corresponding to given ids', async () => {
      // given
      const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
        new Airtable.Record(AIRTABLE_NAME, 'recTuto1', {
          fields: {
            'Record ID': 'recTuto1',
            'id persistant': 'tuto1',
          },
        }),
        new Airtable.Record(AIRTABLE_NAME, 'recTuto2', {
          fields: {
            'Record ID': 'recTuto2',
            'id persistant': 'tuto2',
          },
        }),
      ]);

      const deleteRecords = vi.spyOn(airtable, 'deleteRecords').mockResolvedValueOnce();

      // when
      await tutorialRepository.delete(['tuto1', 'tuto2']);

      // then
      expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, {
        fields: ['Record ID', 'id persistant'],
        filterByFormula: 'OR("tuto1" = {id persistant},"tuto2" = {id persistant})',
      });

      expect(deleteRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, ['recTuto1', 'recTuto2']);
    });
  });
});

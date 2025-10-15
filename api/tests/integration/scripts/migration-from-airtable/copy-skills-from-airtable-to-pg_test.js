import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';

import { CopySkillsFromAirtableToPg } from '../../../../scripts/migration-from-airtable/copy-skills-from-airtable-to-pg.js';
import { logger } from '../../../../lib/infrastructure/logger.js';
import * as airtable from '../../../../lib/infrastructure/airtable.js';
import { databaseBuilder, knex } from '../../../test-helper.js';
import { Skill } from '../../../../lib/domain/models/Skill.js';

const TABLE_NAME = 'skills';
const TUTORIALS_RELATION_TABLE_NAME = 'skills-tutorials';
const AIRTABLE_NAME = 'Acquis';

describe('Integration | Scripts | CopySkillsFromAirtableToPg', () => {
  /** @type {CopySkillsFromAirtableToPg} */
  let script;

  beforeEach(() => {
    script = new CopySkillsFromAirtableToPg();
  });

  describe('#handle', () => {
    afterEach(async () => {
      await knex.delete().from(TUTORIALS_RELATION_TABLE_NAME);
      await knex.delete().from(TABLE_NAME);
    });

    it('reads skills from airtable and saves these to postgres', async () => {
      // given
      const options = { dryRun: false };

      const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
        new Airtable.Record(AIRTABLE_NAME, 'rec123', {
          fields: {
            'id persistant': 'skill1',
            'Statut de l\'indice': Skill.HINT_STATUSES.ARCHIVE,
            'Comprendre (id persistant)': ['tuto1'],
            'En savoir plus (id persistant)': ['tuto2', 'tuto3'],
            'Status': Skill.STATUSES.ARCHIVE,
            'Tube (id persistant)': ['tube123'],
            'Description': 'Un premier acquis',
            'Level': 2,
            'Internationalisation': Skill.INTERNATIONALISATIONS.FRANCE,
            'Version': 2,
            'Statut de la description': Skill.DESCRIPTION_STATUSES.ARCHIVE,
          },
          createdTime: '2025-10-14T00:00:00Z',
        }),
        new Airtable.Record(AIRTABLE_NAME, 'rec456', {
          fields: {
            'id persistant': 'skill2',
            'Statut de l\'indice': Skill.HINT_STATUSES.VALIDE,
            'Comprendre (id persistant)': ['tuto2', 'tuto4'],
            'En savoir plus (id persistant)': ['tuto3'],
            'Status': Skill.STATUSES.ACTIF,
            'Tube (id persistant)': ['tube456'],
            'Description': 'Un deuxième acquis',
            'Level': 6,
            'Internationalisation': Skill.INTERNATIONALISATIONS.UNION_EUROPEENNE,
            'Version': 3,
            'Statut de la description': Skill.DESCRIPTION_STATUSES.VALIDE,
          },
          createdTime: '2025-10-14T13:58:00Z',
        }),
      ]);

      databaseBuilder.factory.buildFramework({ id: 'recFmk123', name: 'Un référentiel' });
      databaseBuilder.factory.buildArea({ id: 'area123', code: '1', frameworkId: 'recFmk123' });
      databaseBuilder.factory.buildCompetence({ id: 'competence123', index: '1.1', areaId: 'area123' });
      databaseBuilder.factory.buildThematic({ id: 'thematic123', index: 0, competenceId: 'competence123' });
      databaseBuilder.factory.buildTube({ id: 'tube123', name: '@dvorak', index: 1, thematicId: 'thematic123' });
      databaseBuilder.factory.buildTube({ id: 'tube456', name: '@qwerty', index: 2, thematicId: 'thematic123' });

      databaseBuilder.factory.buildTutorial({ id: 'tuto1', title: 'title tuto1', format: 'format tuto1', duration: 'duration tuto1', source: 'source tuto1', link: 'link tuto1', locale: 'fr' });
      databaseBuilder.factory.buildTutorial({ id: 'tuto2', title: 'title tuto2', format: 'format tuto2', duration: 'duration tuto2', source: 'source tuto2', link: 'link tuto2', locale: 'fr' });
      databaseBuilder.factory.buildTutorial({ id: 'tuto3', title: 'title tuto3', format: 'format tuto3', duration: 'duration tuto3', source: 'source tuto3', link: 'link tuto3', locale: 'fr' });
      databaseBuilder.factory.buildTutorial({ id: 'tuto4', title: 'title tuto4', format: 'format tuto4', duration: 'duration tuto4', source: 'source tuto4', link: 'link tuto4', locale: 'fr' });

      databaseBuilder.factory.buildSkill({
        id: 'skill1',
        hintStatus: Skill.HINT_STATUSES.VALIDE,
        tutorialIds: ['tuto1', 'tuto2'],
        learningMoreTutorialIds: ['tuto4'],
        status: Skill.STATUSES.ACTIF,
        tubeId: 'tube456',
        description: 'Ancienne description',
        level: 3,
        internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
        version: 1,
        descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
      });
      databaseBuilder.factory.buildSkill({
        id: 'skill2',
        activatedAt: '2025-10-14T17:06:00Z',
        archivedAt: '2025-10-14T17:07:00Z',
        obsoletedAt: '2025-10-14T17:08:00Z',
      });

      await databaseBuilder.commit();

      // when
      await script.handle({ options, logger });

      // then
      expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, { fields: [
        'id persistant',
        'Statut de l\'indice',
        'Comprendre (id persistant)',
        'En savoir plus (id persistant)',
        'Status',
        'Tube (id persistant)',
        'Description',
        'Level',
        'Internationalisation',
        'Version',
        'Statut de la description',
      ] });

      await expect(knex.select('*').from(TABLE_NAME).orderBy('createdAt')).resolves.toStrictEqual([
        {
          id: 'skill1',
          hintStatus: Skill.HINT_STATUSES.ARCHIVE,
          status: Skill.STATUSES.ARCHIVE,
          tubeId: 'tube123',
          description: 'Un premier acquis',
          level: 2,
          internationalisation: Skill.INTERNATIONALISATIONS.FRANCE,
          version: 2,
          descriptionStatus: Skill.DESCRIPTION_STATUSES.ARCHIVE,
          activatedAt: null,
          archivedAt: null,
          obsoletedAt: null,
          createdAt: new Date('2025-10-14T00:00:00Z'),
          updatedAt: expect.any(Date),
        },
        {
          id: 'skill2',
          hintStatus: Skill.HINT_STATUSES.VALIDE,
          status: Skill.STATUSES.ACTIF,
          tubeId: 'tube456',
          description: 'Un deuxième acquis',
          level: 6,
          internationalisation: Skill.INTERNATIONALISATIONS.UNION_EUROPEENNE,
          version: 3,
          descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
          activatedAt: new Date('2025-10-14T17:06:00Z'),
          archivedAt: new Date('2025-10-14T17:07:00Z'),
          obsoletedAt: new Date('2025-10-14T17:08:00Z'),
          createdAt: new Date('2025-10-14T13:58:00Z'),
          updatedAt: expect.any(Date),
        },
      ]);

      await expect(knex.select('*').from(TUTORIALS_RELATION_TABLE_NAME).orderBy(['skillId', 'type', 'tutorialId'])).resolves.toStrictEqual([
        { skillId: 'skill1', type: 'learningMore', tutorialId: 'tuto2', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
        { skillId: 'skill1', type: 'learningMore', tutorialId: 'tuto3', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
        { skillId: 'skill1', type: 'understanding', tutorialId: 'tuto1', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
        { skillId: 'skill2', type: 'learningMore', tutorialId: 'tuto3', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
        { skillId: 'skill2', type: 'understanding', tutorialId: 'tuto2', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
        { skillId: 'skill2', type: 'understanding', tutorialId: 'tuto4', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
      ]);
    });

    describe('when dryRun is true', () => {
      it('reads skills from airtable and stops', async () => {
        // given
        const options = { dryRun: true };

        const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
          new Airtable.Record(AIRTABLE_NAME, 'rec123', {
            fields: {
              'id persistant': 'skill1',
              'Statut de l\'indice': Skill.HINT_STATUSES.ARCHIVE,
              'Comprendre (id persistant)': ['tuto1'],
              'En savoir plus (id persistant)': ['tuto2', 'tuto3'],
              'Status': Skill.STATUSES.ARCHIVE,
              'Tube (id persistant)': ['tube123'],
              'Description': 'Un premier acquis',
              'Level': 2,
              'Internationalisation': Skill.INTERNATIONALISATIONS.FRANCE,
              'Version': 2,
              'Statut de la description': Skill.DESCRIPTION_STATUSES.ARCHIVE,
            },
            createdTime: '2025-10-14T00:00:00Z',
          }),
          new Airtable.Record(AIRTABLE_NAME, 'rec456', {
            fields: {
              'id persistant': 'skill2',
              'Statut de l\'indice': Skill.HINT_STATUSES.VALIDE,
              'Comprendre (id persistant)': ['tuto2', 'tuto4'],
              'En savoir plus (id persistant)': ['tuto3'],
              'Status': Skill.STATUSES.ACTIF,
              'Tube (id persistant)': ['tube456'],
              'Description': 'Un deuxième acquis',
              'Level': 6,
              'Internationalisation': Skill.INTERNATIONALISATIONS.UNION_EUROPEENNE,
              'Version': 3,
              'Statut de la description': Skill.DESCRIPTION_STATUSES.VALIDE,
            },
            createdTime: '2025-10-14T13:58:00Z',
          }),
        ]);

        databaseBuilder.factory.buildFramework({ id: 'recFmk123', name: 'Un référentiel' });
        databaseBuilder.factory.buildArea({ id: 'area123', code: '1', frameworkId: 'recFmk123' });
        databaseBuilder.factory.buildCompetence({ id: 'competence123', index: '1.1', areaId: 'area123' });
        databaseBuilder.factory.buildThematic({ id: 'thematic123', index: 0, competenceId: 'competence123' });
        databaseBuilder.factory.buildTube({ id: 'tube123', name: '@dvorak', index: 1, thematicId: 'thematic123' });
        databaseBuilder.factory.buildTube({ id: 'tube456', name: '@qwerty', index: 2, thematicId: 'thematic123' });

        databaseBuilder.factory.buildTutorial({ id: 'tuto1', title: 'title tuto1', format: 'format tuto1', duration: 'duration tuto1', source: 'source tuto1', link: 'link tuto1', locale: 'fr' });
        databaseBuilder.factory.buildTutorial({ id: 'tuto2', title: 'title tuto2', format: 'format tuto2', duration: 'duration tuto2', source: 'source tuto2', link: 'link tuto2', locale: 'fr' });
        databaseBuilder.factory.buildTutorial({ id: 'tuto3', title: 'title tuto3', format: 'format tuto3', duration: 'duration tuto3', source: 'source tuto3', link: 'link tuto3', locale: 'fr' });
        databaseBuilder.factory.buildTutorial({ id: 'tuto4', title: 'title tuto4', format: 'format tuto4', duration: 'duration tuto4', source: 'source tuto4', link: 'link tuto4', locale: 'fr' });

        databaseBuilder.factory.buildSkill({
          id: 'skill1',
          hintStatus: Skill.HINT_STATUSES.VALIDE,
          tutorialIds: ['tuto1', 'tuto2'],
          learningMoreTutorialIds: ['tuto4'],
          status: Skill.STATUSES.ACTIF,
          tubeId: 'tube456',
          description: 'Ancienne description',
          level: 3,
          internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
          version: 1,
          descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
          createdAt: '2025-10-06T00:00:00Z',
          updatedAt: '2025-10-06T10:00:00Z',
        });
        databaseBuilder.factory.buildSkill({
          id: 'skill2',
          activatedAt: '2025-10-14T17:06:00Z',
          archivedAt: '2025-10-14T17:07:00Z',
          obsoletedAt: '2025-10-14T17:08:00Z',
        });

        await databaseBuilder.commit();

        // when
        await script.handle({ options, logger });

        // then
        expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, { fields: [
          'id persistant',
          'Statut de l\'indice',
          'Comprendre (id persistant)',
          'En savoir plus (id persistant)',
          'Status',
          'Tube (id persistant)',
          'Description',
          'Level',
          'Internationalisation',
          'Version',
          'Statut de la description',
        ] });

        await expect(knex.select('*').from(TABLE_NAME).orderBy('createdAt')).resolves.toStrictEqual([
          {
            id: 'skill1',
            hintStatus: Skill.HINT_STATUSES.VALIDE,
            status: Skill.STATUSES.ACTIF,
            tubeId: 'tube456',
            description: 'Ancienne description',
            level: 3,
            internationalisation: Skill.INTERNATIONALISATIONS.MONDE,
            version: 1,
            descriptionStatus: Skill.DESCRIPTION_STATUSES.VALIDE,
            activatedAt: null,
            archivedAt: null,
            obsoletedAt: null,
            createdAt: new Date('2025-10-06T00:00:00Z'),
            updatedAt: new Date('2025-10-06T10:00:00Z'),
          },
          {
            id: 'skill2',
            hintStatus: null,
            status: null,
            tubeId: null,
            description: null,
            level: null,
            internationalisation: null,
            version: null,
            descriptionStatus: null,
            activatedAt: new Date('2025-10-14T17:06:00Z'),
            archivedAt: new Date('2025-10-14T17:07:00Z'),
            obsoletedAt: new Date('2025-10-14T17:08:00Z'),
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        ]);

        await expect(knex.select('*').from(TUTORIALS_RELATION_TABLE_NAME).orderBy(['skillId', 'type', 'tutorialId'])).resolves.toStrictEqual([
          { skillId: 'skill1', type: 'learningMore', tutorialId: 'tuto4', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
          { skillId: 'skill1', type: 'understanding', tutorialId: 'tuto1', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
          { skillId: 'skill1', type: 'understanding', tutorialId: 'tuto2', createdAt: expect.any(Date), updatedAt: expect.any(Date) },
        ]);
      });
    });
  });
});

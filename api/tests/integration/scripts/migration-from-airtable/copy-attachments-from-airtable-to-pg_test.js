import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';

import { CopyAttachmentsFromAirtableToPg } from '../../../../scripts/migration-from-airtable/copy-attachments-from-airtable-to-pg.js';
import { logger } from '../../../../lib/infrastructure/logger.js';
import * as airtable from '../../../../lib/infrastructure/airtable.js';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';

const TABLE_NAME = 'attachments';
const AIRTABLE_NAME = 'Attachments';

describe('Integration | Scripts | CopyAttachmentsFromAirtableToPg', () => {
  /** @type {CopyAttachmentsFromAirtableToPg} */
  let script;

  beforeEach(() => {
    script = new CopyAttachmentsFromAirtableToPg();
  });

  describe('#handle', () => {
    afterEach(async () => {
      await knex.delete().from(TABLE_NAME);
    });

    it('reads attachments from airtable and saves these to postgres', async () => {
      // given
      const options = { dryRun: false };

      const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
        new Airtable.Record(AIRTABLE_NAME, 'rec123Abc', {
          fields: {
            url: 'https://example.com/pouet.jpg',
            size: 1234,
            type: 'illustration',
            mimeType: 'image/jpeg',
            filename: 'pouet.jpg',
            'challengeId persistant': ['challenge1'],
            localizedChallengeId: 'challenge1',
          },
          createdTime: '2025-09-02T00:00:00Z',
        }),
        new Airtable.Record(AIRTABLE_NAME, 'rec456Def', {
          fields: {
            url: 'https://example.com/toto.mp3',
            size: 9876,
            type: 'attachment',
            mimeType: 'audio/mp3',
            filename: 'toto.mp3',
            'challengeId persistant': ['challenge2'],
            localizedChallengeId: 'challenge2nl',
          },
          createdTime: '2025-09-02T13:58:00Z',
        }),
      ]);

      databaseBuilder.factory.buildFramework({ id: 'recFmk123', name: 'Un référentiel' });
      databaseBuilder.factory.buildArea({ id: 'area123', code: '1', frameworkId: 'recFmk123' });
      databaseBuilder.factory.buildCompetence({ id: 'competence123', index: '1.1', areaId: 'area123' });
      databaseBuilder.factory.buildThematic({ id: 'thematic123', competenceId: 'competence123' });
      databaseBuilder.factory.buildTube({ id: 'tube123', name: '@dvorak', thematicId: 'thematic123' });
      databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube123' });

      databaseBuilder.factory.buildChallenge(
        domainBuilder.buildChallengeDatasourceObject({ id: 'challenge1', skillId: 'skill1' }),
      );
      databaseBuilder.factory.buildLocalizedChallenge({ id: 'challenge1', challengeId: 'challenge1' });

      databaseBuilder.factory.buildChallenge(
        domainBuilder.buildChallengeDatasourceObject({ id: 'challenge2', skillId: 'skill1' }),
      );
      databaseBuilder.factory.buildLocalizedChallenge({ id: 'challenge2', challengeId: 'challenge2' });
      databaseBuilder.factory.buildLocalizedChallenge({ id: 'challenge2nl', challengeId: 'challenge2', locale: 'nl' });

      databaseBuilder.factory.buildAttachment({
        id: 'rec123Abc',
        url: 'https://example.com/plop.png',
        size: 4567,
        type: 'illu',
        mimeType: 'image/png',
        filename: 'plop.png',
        challengeId: 'challenge2',
        localizedChallengeId: 'challenge2',
        createdAt: '2025-09-02T00:00:00Z',
        updatedAt: '2025-09-02T10:00:00Z',
      });

      databaseBuilder.factory.buildAttachment({
        id: 'rec789Xyz',
        url: 'https://example.com/aurevoir.txt',
        size: 4321,
        type: 'attachment',
        mimeType: 'text/plain',
        filename: 'aurevoir.txt',
        challengeId: 'challenge1',
        localizedChallengeId: 'challenge1',
      });

      await databaseBuilder.commit();

      // when
      await script.handle({ options, logger });

      // then
      expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, {
        fields: ['url', 'size', 'type', 'mimeType', 'filename', 'challengeId persistant', 'localizedChallengeId'],
      });

      await expect(knex.select('*').from(TABLE_NAME).orderBy('createdAt')).resolves.toStrictEqual([
        {
          id: 'rec123Abc',
          url: 'https://example.com/pouet.jpg',
          size: 1234,
          type: 'illustration',
          mimeType: 'image/jpeg',
          filename: 'pouet.jpg',
          challengeId: 'challenge1',
          localizedChallengeId: 'challenge1',
          createdAt: new Date('2025-09-02T00:00:00Z'),
          updatedAt: expect.any(Date),
        },
        {
          id: 'rec456Def',
          url: 'https://example.com/toto.mp3',
          size: 9876,
          type: 'attachment',
          mimeType: 'audio/mp3',
          filename: 'toto.mp3',
          challengeId: 'challenge2',
          localizedChallengeId: 'challenge2nl',
          createdAt: new Date('2025-09-02T13:58:00Z'),
          updatedAt: expect.any(Date),
        },
      ]);
    });

    describe('when dryRun is true', () => {
      it('reads attachments from airtable and stops', async () => {
        // given
        const options = { dryRun: true };

        const findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
          new Airtable.Record(AIRTABLE_NAME, 'rec123Abc', {
            fields: {
              url: 'https://example.com/pouet.jpg',
              size: 1234,
              type: 'illustration',
              mimeType: 'image/jpeg',
              filename: 'pouet.jpg',
              'challengeId persistant': ['challenge1'],
              localizedChallengeId: 'challenge1',
            },
            createdTime: '2025-09-02T00:00:00Z',
          }),
          new Airtable.Record(AIRTABLE_NAME, 'rec456Def', {
            fields: {
              url: 'https://example.com/toto.mp3',
              size: 9876,
              type: 'attachment',
              mimeType: 'audio/mp3',
              filename: 'toto.mp3',
              'challengeId persistant': ['challenge2'],
              localizedChallengeId: 'challenge2nl',
            },
            createdTime: '2025-09-02T13:58:00Z',
          }),
        ]);

        databaseBuilder.factory.buildFramework({ id: 'recFmk123', name: 'Un référentiel' });
        databaseBuilder.factory.buildArea({ id: 'area123', code: '1', frameworkId: 'recFmk123' });
        databaseBuilder.factory.buildCompetence({ id: 'competence123', index: '1.1', areaId: 'area123' });
        databaseBuilder.factory.buildThematic({ id: 'thematic123', competenceId: 'competence123' });
        databaseBuilder.factory.buildTube({ id: 'tube123', name: '@dvorak', thematicId: 'thematic123' });
        databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube123' });

        databaseBuilder.factory.buildChallenge(
          domainBuilder.buildChallengeDatasourceObject({ id: 'challenge1', skillId: 'skill1' }),
        );
        databaseBuilder.factory.buildLocalizedChallenge({ id: 'challenge1', challengeId: 'challenge1' });

        databaseBuilder.factory.buildChallenge(
          domainBuilder.buildChallengeDatasourceObject({ id: 'challenge2', skillId: 'skill1' }),
        );
        databaseBuilder.factory.buildLocalizedChallenge({ id: 'challenge2', challengeId: 'challenge2' });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: 'challenge2nl',
          challengeId: 'challenge2',
          locale: 'nl',
        });

        databaseBuilder.factory.buildAttachment({
          id: 'rec123Abc',
          url: 'https://example.com/plop.png',
          size: 4567,
          type: 'illu',
          mimeType: 'image/png',
          filename: 'plop.png',
          challengeId: 'challenge2',
          localizedChallengeId: 'challenge2',
          createdAt: '2025-09-02T00:00:00Z',
          updatedAt: '2025-09-02T10:00:00Z',
        });

        databaseBuilder.factory.buildAttachment({
          id: 'rec789Xyz',
          url: 'https://example.com/aurevoir.txt',
          size: 4321,
          type: 'attachment',
          mimeType: 'text/plain',
          filename: 'aurevoir.txt',
          challengeId: 'challenge1',
          localizedChallengeId: 'challenge1',
        });

        await databaseBuilder.commit();

        // when
        await script.handle({ options, logger });

        // then
        expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, {
          fields: ['url', 'size', 'type', 'mimeType', 'filename', 'challengeId persistant', 'localizedChallengeId'],
        });

        await expect(knex.select('*').from(TABLE_NAME)).resolves.toStrictEqual([
          {
            id: 'rec123Abc',
            url: 'https://example.com/plop.png',
            size: 4567,
            type: 'illu',
            mimeType: 'image/png',
            filename: 'plop.png',
            challengeId: 'challenge2',
            localizedChallengeId: 'challenge2',
            createdAt: new Date('2025-09-02T00:00:00Z'),
            updatedAt: new Date('2025-09-02T10:00:00Z'),
          },
          {
            id: 'rec789Xyz',
            url: 'https://example.com/aurevoir.txt',
            size: 4321,
            type: 'attachment',
            mimeType: 'text/plain',
            filename: 'aurevoir.txt',
            challengeId: 'challenge1',
            localizedChallengeId: 'challenge1',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
        ]);
      });
    });
  });
});

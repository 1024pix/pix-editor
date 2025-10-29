import { beforeEach, describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';

import { FixAttachmentsChallengeId } from '../../../scripts/fix-attachments-challenge-id.js';
import { logger } from '../../../lib/infrastructure/logger.js';
import * as airtable from '../../../lib/infrastructure/airtable.js';
import { databaseBuilder, domainBuilder } from '../../test-helper.js';

describe('Integration | Scripts | FixAttachmentsChallengeId', () => {
  /** @type {FixAttachmentsChallengeId} */
  let script;

  beforeEach(() => {
    script = new FixAttachmentsChallengeId();
  });

  describe('#handle', () => {
    it('finds broken attachments and repairs these', async () => {
      // given
      const options = { dryRun: false };

      const findRecords = vi.spyOn(airtable, 'findRecords');

      findRecords.mockResolvedValueOnce([
        new Airtable.Record('Attachment', 'attachment1', {
          fields: {
            localizedChallengeId: 'localized1',
          },
        }),
        new Airtable.Record('Attachment', 'attachment2', {
          fields: {
            localizedChallengeId: 'localized2',
          },
        }),
        new Airtable.Record('Attachment', 'attachment3', {
          fields: {
            localizedChallengeId: 'localized3',
          },
        }),
      ]);

      findRecords.mockResolvedValueOnce([
        new Airtable.Record('Attachment', 'recChallenge1', {
          fields: {
            'id persistant': 'challenge1',
          },
        }),
        new Airtable.Record('Attachment', 'recChallenge2', {
          fields: {
            'id persistant': 'challenge2',
          },
        }),
      ]);

      const updateRecords = vi.spyOn(airtable, 'updateRecords').mockResolvedValueOnce();

      databaseBuilder.factory.buildFramework({ id: 'framework1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'framework1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(
        domainBuilder.buildChallengeDatasourceObject({ id: 'challenge1', skillId: 'skill1' }),
      );
      databaseBuilder.factory.buildChallenge(
        domainBuilder.buildChallengeDatasourceObject({ id: 'challenge2', skillId: 'skill1' }),
      );
      databaseBuilder.factory.buildLocalizedChallenge({ id: 'localized1', challengeId: 'challenge1' });
      databaseBuilder.factory.buildLocalizedChallenge({ id: 'localized2', challengeId: 'challenge1', locale: 'fi' });
      databaseBuilder.factory.buildLocalizedChallenge({ id: 'localized3', challengeId: 'challenge2' });
      await databaseBuilder.commit();

      // when
      await script.handle({ options, logger });

      // then
      expect(findRecords).toHaveBeenNthCalledWith(1, 'Attachments', {
        fields: ['localizedChallengeId'],
        filterByFormula: 'challengeId = BLANK()',
      });

      expect(findRecords).toHaveBeenNthCalledWith(2, 'Epreuves', {
        fields: ['id persistant'],
        filterByFormula: 'OR({id persistant}="challenge1",{id persistant}="challenge2")',
      });

      expect(updateRecords).toHaveBeenCalledExactlyOnceWith('Attachments', [
        { id: 'attachment1', fields: { challengeId: ['recChallenge1'] } },
        { id: 'attachment2', fields: { challengeId: ['recChallenge1'] } },
        { id: 'attachment3', fields: { challengeId: ['recChallenge2'] } },
      ]);
    });
  });
});

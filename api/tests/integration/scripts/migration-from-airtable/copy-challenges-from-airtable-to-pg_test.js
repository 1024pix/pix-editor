import { beforeEach, describe, expect, it, vi } from 'vitest';
import Airtable from 'airtable';

import { CopyChallengesFromAirtableToPg } from '../../../../scripts/migration-from-airtable/copy-challenges-from-airtable-to-pg.js';
import { logger } from '../../../../lib/infrastructure/logger.js';
import * as airtable from '../../../../lib/infrastructure/airtable.js';
import { databaseBuilder, knex } from '../../../test-helper.js';
import { Challenge } from '../../../../lib/domain/models/Challenge.js';
import { LOCALE, LOCALE_TO_LANGUAGE_MAP } from '../../../../lib/domain/constants.js';

const TABLE_NAME = 'challenges';
const AIRTABLE_NAME = 'Epreuves';

describe('Integration | Scripts | CopyChallengesFromAirtableToPg', () => {
  /** @type {CopyChallengesFromAirtableToPg} */
  let script;

  beforeEach(() => {
    script = new CopyChallengesFromAirtableToPg();
  });

  describe('#handle', () => {
    let findRecords;

    beforeEach(async () => {
      findRecords = vi.spyOn(airtable, 'findRecords').mockResolvedValueOnce([
        new Airtable.Record(AIRTABLE_NAME, 'rec123', {
          fields: {
            'id persistant': 'challenge1',
            Timer: 180,
            "Type d'épreuve": Challenge.TYPES.QROCM,
            'T1 - Espaces, casse & accents': 'Activé',
            'T2 - Ponctuation': 'Activé',
            "T3 - Distance d'édition": 'Désactivé',
            Statut: Challenge.STATUSES.PROPOSE,
            'Acquix (id persistant)': ['skill1'],
            'Embed height': 550,
            Format: Challenge.FORMATS.MOTS,
            'Réponse automatique': true,
            Langues: [LOCALE_TO_LANGUAGE_MAP[LOCALE.FRENCH_SPOKEN], LOCALE_TO_LANGUAGE_MAP[LOCALE.FRENCH_FRANCE]],
            Focalisée: false,
            Généalogie: Challenge.GENEALOGIES.PROTOTYPE,
            'Type péda': Challenge.PEDAGOGIES.Q_SAVOIR,
            Auteur: ['FOO', 'BAR'],
            Déclinable: Challenge.DECLINABLES.FACILEMENT,
            'Version prototype': 2,
            'Version déclinaison': null,
            'Non voyant': Challenge.ACCESSIBILITY1.OK,
            Daltonien: Challenge.ACCESSIBILITY2.RAS,
            Spoil: Challenge.SPOILS.DIFFICILEMENT_SPOILABLE,
            Responsive: Challenge.RESPONSIVES.TABLETTE_ET_SMARTPHONE,
            'Difficulté calculée': '0.1318481094123',
            'Discrimination calculée': '-2.27852812309',
            updated_at: '2025-10-22T12:00:00Z',
            created_at: '2025-10-22T00:00:00Z',
            validated_at: null,
            archived_at: null,
            made_obsolete_at: null,
            shuffled: false,
            contextualizedFields: [Challenge.CONTEXTUALIZED_FIELDS.EMBED, Challenge.CONTEXTUALIZED_FIELDS.INSTRUCTION],
          },
        }),
        new Airtable.Record(AIRTABLE_NAME, 'rec456', {
          fields: {
            'id persistant': 'challenge2',
            Timer: null,
            "Type d'épreuve": Challenge.TYPES.QCM,
            'T1 - Espaces, casse & accents': null,
            'T2 - Ponctuation': null,
            "T3 - Distance d'édition": 'Activé',
            Statut: Challenge.STATUSES.PERIME,
            'Acquix (id persistant)': ['skill2'],
            'Embed height': null,
            Format: null,
            'Réponse automatique': false,
            Langues: [LOCALE_TO_LANGUAGE_MAP[LOCALE.ENGLISH_SPOKEN]],
            Focalisée: true,
            Généalogie: Challenge.GENEALOGIES.DECLINAISON,
            'Type péda': Challenge.PEDAGOGIES.Q_SITUATION,
            Auteur: ['BAR', 'BAZ'],
            Déclinable: Challenge.DECLINABLES.DIFFICILEMENT,
            'Version prototype': 1,
            'Version déclinaison': 3,
            'Non voyant': Challenge.ACCESSIBILITY1.KO,
            Daltonien: Challenge.ACCESSIBILITY2.OK,
            Spoil: Challenge.SPOILS.FACILEMENT_SPOILABLE,
            Responsive: Challenge.RESPONSIVES.TABLETTE,
            'Difficulté calculée': null,
            'Discrimination calculée': null,
            updated_at: '2025-10-22T13:00:00Z',
            created_at: '2025-10-22T01:00:00Z',
            validated_at: '2025-10-22T03:00:00Z',
            archived_at: '2025-10-22T05:00:00Z',
            made_obsolete_at: '2025-10-22T08:00:00Z',
            shuffled: true,
            contextualizedFields: [
              Challenge.CONTEXTUALIZED_FIELDS.INSTRUCTION,
              Challenge.CONTEXTUALIZED_FIELDS.PROPOSALS,
              Challenge.CONTEXTUALIZED_FIELDS.SOLUTION,
            ],
          },
        }),
      ]);

      databaseBuilder.factory.buildFramework({ id: 'recFmk123', name: 'Un référentiel' });
      databaseBuilder.factory.buildArea({ id: 'area123', code: '1', frameworkId: 'recFmk123' });
      databaseBuilder.factory.buildCompetence({ id: 'competence123', index: '1.1', areaId: 'area123' });
      databaseBuilder.factory.buildThematic({ id: 'thematic123', competenceId: 'competence123' });
      databaseBuilder.factory.buildTube({ id: 'tube123', name: '@dvorak', thematicId: 'thematic123' });
      databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube123' });
      databaseBuilder.factory.buildSkill({ id: 'skill2', tubeId: 'tube123' });
      databaseBuilder.factory.buildChallenge({
        id: 'challenge1',
        t1Status: false,
        t2Status: false,
        t3Status: false,
        autoReply: false,
        focusable: false,
        shuffled: false,
        createdAt: '2025-10-21T01:00:00Z',
        updatedAt: '2025-10-21T02:00:00Z',
      });

      await databaseBuilder.commit();
    });

    it('reads challenges from airtable and saves these to postgres', async () => {
      // given
      const options = { dryRun: false, chunkSize: 500 };

      // when
      await script.handle({ options, logger });

      // then
      expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, {
        fields: [
          'id persistant',
          'Timer',
          "Type d'épreuve",
          'T1 - Espaces, casse & accents',
          'T2 - Ponctuation',
          "T3 - Distance d'édition",
          'Statut',
          'Acquix (id persistant)',
          'Embed height',
          'Format',
          'Réponse automatique',
          'Langues',
          'Focalisée',
          'Généalogie',
          'Type péda',
          'Auteur',
          'Déclinable',
          'Version prototype',
          'Version déclinaison',
          'Non voyant',
          'Daltonien',
          'Spoil',
          'Responsive',
          'Difficulté calculée',
          'Discrimination calculée',
          'updated_at',
          'created_at',
          'validated_at',
          'archived_at',
          'made_obsolete_at',
          'shuffled',
          'contextualizedFields',
        ],
      });

      await expect(knex.select('*').from(TABLE_NAME).orderBy('createdAt')).resolves.toStrictEqual([
        {
          id: 'challenge1',
          timer: 180,
          type: Challenge.TYPES.QROCM,
          t1Status: true,
          t2Status: true,
          t3Status: false,
          status: Challenge.STATUSES.PROPOSE,
          skillId: 'skill1',
          embedHeight: 550,
          format: Challenge.FORMATS.MOTS,
          autoReply: true,
          locales: [LOCALE.FRENCH_SPOKEN, LOCALE.FRENCH_FRANCE],
          focusable: false,
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          pedagogy: Challenge.PEDAGOGIES.Q_SAVOIR,
          author: ['FOO', 'BAR'],
          declinable: Challenge.DECLINABLES.FACILEMENT,
          version: 2,
          alternativeVersion: null,
          accessibility1: Challenge.ACCESSIBILITY1.OK,
          accessibility2: Challenge.ACCESSIBILITY2.RAS,
          spoil: Challenge.SPOILS.DIFFICILEMENT_SPOILABLE,
          responsive: Challenge.RESPONSIVES.TABLETTE_ET_SMARTPHONE,
          delta: 0.1318481094123,
          alpha: -2.27852812309,
          updatedAt: new Date('2025-10-22T12:00:00Z'),
          createdAt: new Date('2025-10-22T00:00:00Z'),
          validatedAt: null,
          archivedAt: null,
          madeObsoleteAt: null,
          shuffled: false,
          contextualizedFields: [Challenge.CONTEXTUALIZED_FIELDS.EMBED, Challenge.CONTEXTUALIZED_FIELDS.INSTRUCTION],
        },
        {
          id: 'challenge2',
          timer: null,
          type: Challenge.TYPES.QCM,
          t1Status: false,
          t2Status: false,
          t3Status: true,
          status: Challenge.STATUSES.PERIME,
          skillId: 'skill2',
          embedHeight: null,
          format: null,
          autoReply: false,
          locales: [LOCALE.ENGLISH_SPOKEN],
          focusable: true,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
          author: ['BAR', 'BAZ'],
          declinable: Challenge.DECLINABLES.DIFFICILEMENT,
          version: 1,
          alternativeVersion: 3,
          accessibility1: Challenge.ACCESSIBILITY1.KO,
          accessibility2: Challenge.ACCESSIBILITY2.OK,
          spoil: Challenge.SPOILS.FACILEMENT_SPOILABLE,
          responsive: Challenge.RESPONSIVES.TABLETTE,
          delta: null,
          alpha: null,
          updatedAt: new Date('2025-10-22T13:00:00Z'),
          createdAt: new Date('2025-10-22T01:00:00Z'),
          validatedAt: new Date('2025-10-22T03:00:00Z'),
          archivedAt: new Date('2025-10-22T05:00:00Z'),
          madeObsoleteAt: new Date('2025-10-22T08:00:00Z'),
          shuffled: true,
          contextualizedFields: [
            Challenge.CONTEXTUALIZED_FIELDS.INSTRUCTION,
            Challenge.CONTEXTUALIZED_FIELDS.PROPOSALS,
            Challenge.CONTEXTUALIZED_FIELDS.SOLUTION,
          ],
        },
      ]);
    });

    describe('when dryRun is true', () => {
      it('reads challenges from airtable and stops', async () => {
        // given
        const options = { dryRun: true, chunkSize: 500 };

        // when
        await script.handle({ options, logger });

        // then
        expect(findRecords).toHaveBeenCalledExactlyOnceWith(AIRTABLE_NAME, {
          fields: [
            'id persistant',
            'Timer',
            "Type d'épreuve",
            'T1 - Espaces, casse & accents',
            'T2 - Ponctuation',
            "T3 - Distance d'édition",
            'Statut',
            'Acquix (id persistant)',
            'Embed height',
            'Format',
            'Réponse automatique',
            'Langues',
            'Focalisée',
            'Généalogie',
            'Type péda',
            'Auteur',
            'Déclinable',
            'Version prototype',
            'Version déclinaison',
            'Non voyant',
            'Daltonien',
            'Spoil',
            'Responsive',
            'Difficulté calculée',
            'Discrimination calculée',
            'updated_at',
            'created_at',
            'validated_at',
            'archived_at',
            'made_obsolete_at',
            'shuffled',
            'contextualizedFields',
          ],
        });

        await expect(knex.select('*').from(TABLE_NAME).orderBy('createdAt')).resolves.toStrictEqual([
          {
            id: 'challenge1',
            timer: null,
            type: null,
            t1Status: false,
            t2Status: false,
            t3Status: false,
            status: null,
            skillId: null,
            embedHeight: null,
            format: null,
            autoReply: false,
            locales: [],
            focusable: false,
            genealogy: null,
            pedagogy: null,
            author: null,
            declinable: null,
            version: null,
            alternativeVersion: null,
            accessibility1: null,
            accessibility2: null,
            spoil: null,
            responsive: null,
            delta: null,
            alpha: null,
            updatedAt: new Date('2025-10-21T02:00:00Z'),
            createdAt: new Date('2025-10-21T01:00:00Z'),
            validatedAt: null,
            archivedAt: null,
            madeObsoleteAt: null,
            shuffled: false,
            contextualizedFields: null,
          },
        ]);
      });
    });
  });
});

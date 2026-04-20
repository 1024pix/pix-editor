import { describe, expect, it } from 'vitest';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import { Challenge, LocalizedChallenge } from '../../../../lib/domain/models/index.js';
import * as challengeRepository from '../../../../lib/infrastructure/repositories/challenge-repository.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Integration | Repository | challenge-repository', () => {
  describe('get', () => {
    it('should return the challenge when exist', async () => {
      // given
      const challengeA_data = {
        id: 'challengeA_id',
        localizedEsId: 'locES_challengeA_id',
        skillId: 'skillId',
        competenceId: 'competence1',
        type: 'type challengeA',
        t1StatusAirtable: 'Activé',
        t1Status: true,
        t2StatusAirtable: 'Désactivé',
        t2Status: false,
        t3StatusAirtable: 'Activé',
        t3Status: true,
        status: Challenge.STATUSES.PROPOSE,
        isQualityOk: false,
        embedHeight: 678,
        timer: 789,
        format: Challenge.FORMATS.MOTS,
        autoReply: false,
        localesAirtable: ['Francophone'],
        locales: ['fr'],
        focusable: false,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
        author: ['QWE'],
        declinable: Challenge.DECLINABLES.FACILEMENT,
        version: 1,
        alternativeVersion: 2,
        accessibility1: Challenge.ACCESSIBILITY1.KO,
        accessibility2: Challenge.ACCESSIBILITY2.RAS,
        spoil: Challenge.SPOILS.NON_SPOILABLE,
        responsive: Challenge.RESPONSIVES.SMARTPHONE,
        geography: 'FR',
        validatedAt: null,
        archivedAt: null,
        createdAt: '2025-10-22T17:55:00Z',
        updatedAt: '2025-10-22T17:56:00Z',
        madeObsoleteAt: null,
        shuffled: true,
        files: [{ fileId: 'attachmentA', localizedChallengeId: 'challengeA_id' }, { fileId: 'attachmentB', localizedChallengeId: 'locES_challengeA_id' }],
        assessmentMaintenanceTags: [Challenge.ASSESSMENT_MAINTENANCE_TAGS.FILE_TO_REDO],
      };
      const primaryLoc_challengeA_data = {
        embedUrl: 'embedUrl primaryloc challengeA',
        fileIds: ['attachmentA'],
        locale: 'fr',
        status: null,
        geography: 'FR',
        urlsToConsult: ['http://primaryloc.challengeA'],
      };
      const esLoc_challengeA_data = {
        embedUrl: 'embedUrl esLoc challengeA',
        fileIds: ['attachmentB'],
        locale: 'es',
        status: LocalizedChallenge.STATUSES.PAUSE,
        geography: 'ES',
        urlsToConsult: ['http://esLoc.challengeA'],
      };

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: challengeA_data.skillId, tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(challengeA_data);

      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeA_id.instruction',
        locale: 'fr',
        value: 'instruction FR challengeA',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeA_id.instruction',
        locale: 'es',
        value: 'instruction ES challengeA',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeA_id.solution',
        locale: 'fr',
        value: 'solution FR challengeA',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeA_id',
        challengeId: 'challengeA_id',
        ...primaryLoc_challengeA_data,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'locES_challengeA_id',
        challengeId: 'challengeA_id',
        ...esLoc_challengeA_data,
      });
      databaseBuilder.factory.buildAttachment(
        domainBuilder.buildAttachmentDatasourceObject({
          id: 'attachmentA',
          challengeId: 'challengeA_id',
          localizedChallengeId: 'challengeA_id',
        }),
      );
      databaseBuilder.factory.buildAttachment(
        domainBuilder.buildAttachmentDatasourceObject({
          id: 'attachmentB',
          challengeId: 'challengeA_id',
          localizedChallengeId: 'locES_challengeA_id',
        }),
      );
      await databaseBuilder.commit();

      // when
      const challenge = await challengeRepository.get(challengeA_data.id);

      // then
      expect(challenge).toStrictEqual(
        domainBuilder.buildChallenge({
          accessibility1: challengeA_data.accessibility1,
          accessibility2: challengeA_data.accessibility2,
          alternativeVersion: challengeA_data.alternativeVersion,
          archivedAt: challengeA_data.archivedAt,
          assessmentMaintenanceTags: challengeA_data.assessmentMaintenanceTags,
          author: challengeA_data.author,
          autoReply: challengeA_data.autoReply,
          competenceId: challengeA_data.competenceId,
          createdAt: challengeA_data.createdAt,
          declinable: challengeA_data.declinable,
          embedHeight: challengeA_data.embedHeight,
          files: challengeA_data.files,
          focusable: challengeA_data.focusable,
          format: challengeA_data.format,
          genealogy: challengeA_data.genealogy,
          geography: challengeA_data.geography,
          id: challengeA_data.id,
          isQualityOk: challengeA_data.isQualityOk,
          locales: challengeA_data.locales,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({
              id: challengeA_data.localizedEsId,
              challengeId: challengeA_data.id,
              ...esLoc_challengeA_data,
            }),
            domainBuilder.buildLocalizedChallenge({
              id: challengeA_data.id,
              challengeId: challengeA_data.id,
              ...primaryLoc_challengeA_data,
            }),
          ],
          madeObsoleteAt: challengeA_data.madeObsoleteAt,
          pedagogy: challengeA_data.pedagogy,
          responsive: challengeA_data.responsive,
          shuffled: challengeA_data.shuffled,
          skillId: challengeA_data.skillId,
          spoil: challengeA_data.spoil,
          status: challengeA_data.status,
          t1Status: challengeA_data.t1Status,
          t2Status: challengeA_data.t2Status,
          t3Status: challengeA_data.t3Status,
          timer: challengeA_data.timer,
          translations: {
            fr: {
              instruction: 'instruction FR challengeA',
              solution: 'solution FR challengeA',
            },
            es: { instruction: 'instruction ES challengeA' },
          },
          type: challengeA_data.type,
          updatedAt: challengeA_data.updatedAt,
          validatedAt: challengeA_data.validatedAt,
          version: challengeA_data.version,
        }),
      );
    });

    it('should throw a NotFound error when no challenge exist for given id', async () => {
      // when
      const promise = challengeRepository.get('someChallengeId');

      // then
      await expect(promise).rejects.to.deep.equal(new NotFoundError('Épreuve introuvable'));
    });
  });

  describe('filter', () => {
    describe('when search is present in instruction or proposals', () => {
      it('should find challenges where translations included the search', async () => {
        // given
        const challengeA_data = {
          id: 'challengeA_id',
          localizedEsId: 'locES_challengeA_id',
          skillId: 'skillId',
          competenceId: 'competence1',
          type: 'type challengeA',
          t1StatusAirtable: 'Activé',
          t1Status: true,
          t2StatusAirtable: 'Désactivé',
          t2Status: false,
          t3StatusAirtable: 'Activé',
          t3Status: true,
          status: Challenge.STATUSES.PROPOSE,
          embedUrl: 'embedUrl challengeA',
          embedHeight: 987,
          timer: 789,
          format: Challenge.FORMATS.MOTS,
          autoReply: false,
          localesAirtable: ['Francophone'],
          locales: ['fr'],
          focusable: true,
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
          author: ['TRO'],
          declinable: Challenge.DECLINABLES.FACILEMENT,
          version: 2,
          alternativeVersion: 3,
          accessibility1: Challenge.ACCESSIBILITY1.KO,
          accessibility2: Challenge.ACCESSIBILITY2.RAS,
          spoil: Challenge.SPOILS.NON_SPOILABLE,
          responsive: Challenge.RESPONSIVES.SMARTPHONE,
          geography: 'FR',
          files: [{ fileId: 'attachmentA', localizedChallengeId: 'challengeA_id' }, { fileId: 'attachmentB', localizedChallengeId: 'locES_challengeA_id' }],
          validatedAt: null,
          archivedAt: null,
          createdAt: '2025-10-23T10:17:00Z',
          updatedAt: '2025-10-23T10:18:00Z',
          madeObsoleteAt: null,
          shuffled: false,
          assessmentMaintenanceTags: [Challenge.ASSESSMENT_MAINTENANCE_TAGS.FILE_TO_REDO],
        };

        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
        databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
        databaseBuilder.factory.buildSkill({ id: challengeA_data.skillId, tubeId: 'tube1' });
        databaseBuilder.factory.buildChallenge(challengeA_data);

        const primaryLoc_challengeA_data = {
          embedUrl: 'embedUrl primaryloc challengeA',
          fileIds: ['attachmentA'],
          locale: 'fr',
          status: null,
          geography: 'FR',
          urlsToConsult: ['http://primaryloc.challengeA'],
        };
        const esLoc_challengeA_data = {
          embedUrl: 'embedUrl esLoc challengeA',
          fileIds: ['attachmentB'],
          locale: 'es',
          status: LocalizedChallenge.STATUSES.PAUSE,
          geography: 'ES',
          urlsToConsult: ['http://esLoc.challengeA'],
        };
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.challengeA_id.instruction',
          locale: 'fr',
          value: 'instruction FR challengeA TotO',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.challengeA_id.instruction',
          locale: 'es',
          value: 'instruction ES challengeA',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.challengeA_id.solution',
          locale: 'fr',
          value: 'solution FR challengeA',
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: 'challengeA_id',
          challengeId: 'challengeA_id',
          ...primaryLoc_challengeA_data,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: 'locES_challengeA_id',
          challengeId: 'challengeA_id',
          ...esLoc_challengeA_data,
        });
        databaseBuilder.factory.buildAttachment(
          domainBuilder.buildAttachmentDatasourceObject({
            id: 'attachmentA',
            challengeId: 'challengeA_id',
            localizedChallengeId: 'challengeA_id',
          }),
        );
        databaseBuilder.factory.buildAttachment(
          domainBuilder.buildAttachmentDatasourceObject({
            id: 'attachmentB',
            challengeId: 'challengeA_id',
            localizedChallengeId: 'locES_challengeA_id',
          }),
        );
        const challengeB_data = {
          id: 'challengeB_id',
          skillId: 'skillId',
          competenceId: 'competence1',
          type: 'type challengeB',
          t1StatusAirtable: 'Désactivé',
          t1Status: false,
          t2StatusAirtable: 'Désactivé',
          t2Status: false,
          t3StatusAirtable: 'Activé',
          t3Status: true,
          status: Challenge.STATUSES.PROPOSE,
          isQualityOk: false,
          embedUrl: 'embedUrl challengeB',
          embedHeight: null,
          timer: 145,
          format: Challenge.FORMATS.MOTS,
          autoReply: true,
          localesAirtable: ['Francophone'],
          locales: ['fr'],
          focusable: false,
          genealogy: Challenge.GENEALOGIES.DECLINAISON,
          pedagogy: Challenge.PEDAGOGIES.Q_SAVOIR,
          author: ['QWE'],
          declinable: Challenge.DECLINABLES.NON,
          version: 1,
          alternativeVersion: null,
          accessibility1: Challenge.ACCESSIBILITY1.OK,
          accessibility2: Challenge.ACCESSIBILITY2.OK,
          spoil: Challenge.SPOILS.FACILEMENT_SPOILABLE,
          responsive: Challenge.RESPONSIVES.TABLETTE,
          geography: 'FR',
          files: [],
          validatedAt: null,
          archivedAt: null,
          createdAt: '2025-10-23T10:19:00Z',
          madeObsoleteAt: null,
          updatedAt: '2025-10-23T10:20:00Z',
          shuffled: false,
          assessmentMaintenanceTags: [Challenge.ASSESSMENT_MAINTENANCE_TAGS.FILE_TO_REDO],
        };

        databaseBuilder.factory.buildChallenge(challengeB_data);

        const primaryLoc_challengeB_data = {
          embedUrl: 'embedUrl primaryloc challengeB',
          fileIds: [],
          locale: 'fr',
          status: null,
          geography: 'FR',
          urlsToConsult: ['http://primaryloc.challengeB'],
        };
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.challengeB_id.instruction',
          locale: 'fr',
          value: 'instruction FR challengeB',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.challengeB_id.proposals',
          locale: 'fr',
          value: 'proposals FR challengeB TotO',
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: 'challengeB_id',
          challengeId: 'challengeB_id',
          ...primaryLoc_challengeB_data,
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.challengeC_id.solution',
          locale: 'fr',
          value: 'solution FR challengeC ToTO but solution not in the search fields',
        });
        await databaseBuilder.commit();

        // when
        const challenges = await challengeRepository.filter({ filter: { search: 'toto' }, page: { size: 5 } });

        // then
        expect(challenges).toStrictEqual([
          domainBuilder.buildChallenge({
            accessibility1: challengeA_data.accessibility1,
            accessibility2: challengeA_data.accessibility2,
            alternativeVersion: challengeA_data.alternativeVersion,
            archivedAt: challengeA_data.archivedAt,
            assessmentMaintenanceTags: challengeA_data.assessmentMaintenanceTags,
            author: challengeA_data.author,
            autoReply: challengeA_data.autoReply,
            competenceId: challengeA_data.competenceId,
            createdAt: challengeA_data.createdAt,
            declinable: challengeA_data.declinable,
            embedHeight: challengeA_data.embedHeight,
            files: challengeA_data.files,
            focusable: challengeA_data.focusable,
            format: challengeA_data.format,
            genealogy: challengeA_data.genealogy,
            geography: challengeA_data.geography,
            id: challengeA_data.id,
            isQualityOk: challengeA_data.isQualityOk,
            locales: challengeA_data.locales,
            localizedChallenges: [
              domainBuilder.buildLocalizedChallenge({
                id: challengeA_data.localizedEsId,
                challengeId: challengeA_data.id,
                ...esLoc_challengeA_data,
              }),
              domainBuilder.buildLocalizedChallenge({
                id: challengeA_data.id,
                challengeId: challengeA_data.id,
                ...primaryLoc_challengeA_data,
              }),
            ],
            madeObsoleteAt: challengeA_data.madeObsoleteAt,
            pedagogy: challengeA_data.pedagogy,
            responsive: challengeA_data.responsive,
            shuffled: challengeA_data.shuffled,
            skillId: challengeA_data.skillId,
            spoil: challengeA_data.spoil,
            status: challengeA_data.status,
            t1Status: challengeA_data.t1Status,
            t2Status: challengeA_data.t2Status,
            t3Status: challengeA_data.t3Status,
            timer: challengeA_data.timer,
            translations: {
              fr: {
                instruction: 'instruction FR challengeA TotO',
                solution: 'solution FR challengeA',
              },
              es: { instruction: 'instruction ES challengeA' },
            },
            type: challengeA_data.type,
            updatedAt: challengeA_data.updatedAt,
            validatedAt: challengeA_data.validatedAt,
            version: challengeA_data.version,
          }),
          domainBuilder.buildChallenge({
            accessibility1: challengeB_data.accessibility1,
            accessibility2: challengeB_data.accessibility2,
            alternativeVersion: challengeB_data.alternativeVersion,
            archivedAt: challengeB_data.archivedAt,
            assessmentMaintenanceTags: challengeB_data.assessmentMaintenanceTags,
            author: challengeB_data.author,
            autoReply: challengeB_data.autoReply,
            competenceId: challengeB_data.competenceId,
            createdAt: challengeB_data.createdAt,
            declinable: challengeB_data.declinable,
            embedHeight: challengeB_data.embedHeight,
            files: challengeB_data.files,
            focusable: challengeB_data.focusable,
            format: challengeB_data.format,
            genealogy: challengeB_data.genealogy,
            geography: challengeB_data.geography,
            id: challengeB_data.id,
            locales: challengeB_data.locales,
            localizedChallenges: [
              domainBuilder.buildLocalizedChallenge({
                id: challengeB_data.id,
                challengeId: challengeB_data.id,
                ...primaryLoc_challengeB_data,
              }),
            ],
            madeObsoleteAt: challengeB_data.madeObsoleteAt,
            pedagogy: challengeB_data.pedagogy,
            responsive: challengeB_data.responsive,
            shuffled: challengeB_data.shuffled,
            skillId: challengeB_data.skillId,
            spoil: challengeB_data.spoil,
            status: challengeB_data.status,
            t1Status: challengeB_data.t1Status,
            t2Status: challengeB_data.t2Status,
            t3Status: challengeB_data.t3Status,
            timer: challengeB_data.timer,
            translations: {
              fr: {
                instruction: 'instruction FR challengeB',
                proposals: 'proposals FR challengeB TotO',
              },
            },
            type: challengeB_data.type,
            updatedAt: challengeB_data.updatedAt,
            validatedAt: challengeB_data.validatedAt,
            version: challengeB_data.version,
          }),
        ]);
      });
    });

    describe('when search is not present in instruction or proposals', () => {
      it('should find challenges where embed url contains search', async () => {
        // given
        const challengeA_data = {
          id: 'challengeA_id',
          localizedEsId: 'locES_challengeA_id',
          skillId: 'skillId',
          competenceId: 'competence1',
          type: 'type challengeA',
          t1StatusAirtable: 'Activé',
          t1Status: true,
          t2StatusAirtable: 'Désactivé',
          t2Status: false,
          t3StatusAirtable: 'Activé',
          t3Status: true,
          status: Challenge.STATUSES.PROPOSE,
          embedUrl: 'embedUrl challengeA',
          embedHeight: 987,
          timer: 789,
          format: Challenge.FORMATS.MOTS,
          autoReply: false,
          localesAirtable: ['Francophone'],
          locales: ['fr'],
          focusable: true,
          genealogy: Challenge.GENEALOGIES.PROTOTYPE,
          pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
          author: ['TRO'],
          declinable: Challenge.DECLINABLES.FACILEMENT,
          version: 2,
          alternativeVersion: 3,
          accessibility1: Challenge.ACCESSIBILITY1.KO,
          accessibility2: Challenge.ACCESSIBILITY2.RAS,
          spoil: Challenge.SPOILS.NON_SPOILABLE,
          responsive: Challenge.RESPONSIVES.SMARTPHONE,
          geography: 'FR',
          files: [{ fileId: 'attachmentA', localizedChallengeId: 'challengeA_id' }, { fileId: 'attachmentB', localizedChallengeId: 'locES_challengeA_id' }],
          validatedAt: null,
          archivedAt: null,
          createdAt: '2025-10-23T10:17:00Z',
          updatedAt: '2025-10-23T10:18:00Z',
          madeObsoleteAt: null,
          shuffled: false,
          assessmentMaintenanceTags: [Challenge.ASSESSMENT_MAINTENANCE_TAGS.EMBED_NAME],
        };

        databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
        databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
        databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
        databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
        databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
        databaseBuilder.factory.buildSkill({ id: challengeA_data.skillId, tubeId: 'tube1' });
        databaseBuilder.factory.buildChallenge(challengeA_data);

        const primaryLoc_challengeA_data = {
          embedUrl: 'embedUrl toto primaryloc challengeA',
          fileIds: ['attachmentA'],
          locale: 'fr',
          status: null,
          geography: 'FR',
          urlsToConsult: ['http://primaryloc.challengeA'],
        };
        const esLoc_challengeA_data = {
          embedUrl: 'embedUrl esLoc challengeA',
          fileIds: ['attachmentB'],
          locale: 'es',
          status: LocalizedChallenge.STATUSES.PAUSE,
          geography: 'ES',
          urlsToConsult: ['http://esLoc.challengeA'],
        };
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.challengeA_id.instruction',
          locale: 'fr',
          value: 'instruction FR challengeA',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.challengeA_id.instruction',
          locale: 'es',
          value: 'instruction ES challengeA',
        });
        databaseBuilder.factory.buildTranslation({
          key: 'challenge.challengeA_id.solution',
          locale: 'fr',
          value: 'solution FR challengeA',
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: 'challengeA_id',
          challengeId: 'challengeA_id',
          ...primaryLoc_challengeA_data,
        });
        databaseBuilder.factory.buildLocalizedChallenge({
          id: 'locES_challengeA_id',
          challengeId: 'challengeA_id',
          ...esLoc_challengeA_data,
        });
        databaseBuilder.factory.buildAttachment(
          domainBuilder.buildAttachmentDatasourceObject({
            id: 'attachmentA',
            challengeId: 'challengeA_id',
            localizedChallengeId: 'challengeA_id',
          }),
        );
        databaseBuilder.factory.buildAttachment(
          domainBuilder.buildAttachmentDatasourceObject({
            id: 'attachmentB',
            challengeId: 'challengeA_id',
            localizedChallengeId: 'locES_challengeA_id',
          }),
        );
        await databaseBuilder.commit();

        // when
        const challenges = await challengeRepository.filter({ filter: { search: 'toto' }, page: { size: 5 } });

        // then
        expect(challenges).toStrictEqual([
          domainBuilder.buildChallenge({
            accessibility1: challengeA_data.accessibility1,
            accessibility2: challengeA_data.accessibility2,
            alternativeVersion: challengeA_data.alternativeVersion,
            archivedAt: challengeA_data.archivedAt,
            assessmentMaintenanceTags: challengeA_data.assessmentMaintenanceTags,
            author: challengeA_data.author,
            autoReply: challengeA_data.autoReply,
            competenceId: challengeA_data.competenceId,
            createdAt: challengeA_data.createdAt,
            declinable: challengeA_data.declinable,
            embedHeight: challengeA_data.embedHeight,
            files: challengeA_data.files,
            focusable: challengeA_data.focusable,
            format: challengeA_data.format,
            genealogy: challengeA_data.genealogy,
            geography: challengeA_data.geography,
            id: challengeA_data.id,
            isQualityOk: challengeA_data.isQualityOk,
            locales: challengeA_data.locales,
            localizedChallenges: [
              domainBuilder.buildLocalizedChallenge({
                id: challengeA_data.localizedEsId,
                challengeId: challengeA_data.id,
                ...esLoc_challengeA_data,
              }),
              domainBuilder.buildLocalizedChallenge({
                id: challengeA_data.id,
                challengeId: challengeA_data.id,
                ...primaryLoc_challengeA_data,
              }),
            ],
            madeObsoleteAt: challengeA_data.madeObsoleteAt,
            pedagogy: challengeA_data.pedagogy,
            responsive: challengeA_data.responsive,
            shuffled: challengeA_data.shuffled,
            skillId: challengeA_data.skillId,
            spoil: challengeA_data.spoil,
            status: challengeA_data.status,
            t1Status: challengeA_data.t1Status,
            t2Status: challengeA_data.t2Status,
            t3Status: challengeA_data.t3Status,
            timer: challengeA_data.timer,
            translations: {
              fr: {
                instruction: 'instruction FR challengeA',
                solution: 'solution FR challengeA',
              },
              es: { instruction: 'instruction ES challengeA' },
            },
            type: challengeA_data.type,
            updatedAt: challengeA_data.updatedAt,
            validatedAt: challengeA_data.validatedAt,
            version: challengeA_data.version,
          }),
        ]);
      });
    });
  });

  describe('#listBySkillId', () => {
    it('should retrieve challenges by given skill id', async () => {
      // given
      const challengeA_data = {
        id: 'challengeA_id',
        localizedEsId: 'locES_challengeA_id',
        skillId: 'skillId',
        competenceId: 'competence1',
        type: 'type challengeA',
        t1StatusAirtable: 'Activé',
        t1Status: true,
        t2StatusAirtable: 'Désactivé',
        t2Status: false,
        t3StatusAirtable: 'Activé',
        t3Status: true,
        status: Challenge.STATUSES.PROPOSE,
        embedUrl: 'embedUrl challengeA',
        embedHeight: 987,
        timer: 789,
        format: Challenge.FORMATS.MOTS,
        autoReply: false,
        localesAirtable: ['Francophone'],
        locales: ['fr'],
        focusable: true,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
        author: ['TRO'],
        declinable: Challenge.DECLINABLES.FACILEMENT,
        version: 2,
        alternativeVersion: 3,
        accessibility1: Challenge.ACCESSIBILITY1.KO,
        accessibility2: Challenge.ACCESSIBILITY2.RAS,
        spoil: Challenge.SPOILS.NON_SPOILABLE,
        responsive: Challenge.RESPONSIVES.SMARTPHONE,
        geography: 'FR',
        files: [{ fileId: 'attachmentA', localizedChallengeId: 'challengeA_id' }, { fileId: 'attachmentB', localizedChallengeId: 'locES_challengeA_id' }],
        validatedAt: null,
        archivedAt: null,
        createdAt: '2025-10-23T10:17:00Z',
        updatedAt: '2025-10-23T10:18:00Z',
        madeObsoleteAt: null,
        shuffled: false,
        assessmentMaintenanceTags: [Challenge.ASSESSMENT_MAINTENANCE_TAGS.ENGLISH_WORD],
      };

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: challengeA_data.skillId, tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(challengeA_data);

      const primaryLoc_challengeA_data = {
        embedUrl: 'embedUrl primaryloc challengeA',
        fileIds: ['attachmentA'],
        locale: 'fr',
        status: null,
        geography: 'FR',
        urlsToConsult: ['http://primaryloc.challengeA'],
      };
      const esLoc_challengeA_data = {
        embedUrl: 'embedUrl esLoc challengeA',
        fileIds: ['attachmentB'],
        locale: 'es',
        status: LocalizedChallenge.STATUSES.PAUSE,
        geography: 'ES',
        urlsToConsult: ['http://esLoc.challengeA'],
      };
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeA_id.instruction',
        locale: 'fr',
        value: 'instruction FR challengeA',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeA_id.instruction',
        locale: 'es',
        value: 'instruction ES challengeA',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeA_id.solution',
        locale: 'fr',
        value: 'solution FR challengeA',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeA_id',
        challengeId: 'challengeA_id',
        ...primaryLoc_challengeA_data,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'locES_challengeA_id',
        challengeId: 'challengeA_id',
        ...esLoc_challengeA_data,
      });
      databaseBuilder.factory.buildAttachment(
        domainBuilder.buildAttachmentDatasourceObject({
          id: 'attachmentA',
          challengeId: 'challengeA_id',
          localizedChallengeId: 'challengeA_id',
        }),
      );
      databaseBuilder.factory.buildAttachment(
        domainBuilder.buildAttachmentDatasourceObject({
          id: 'attachmentB',
          challengeId: 'challengeA_id',
          localizedChallengeId: 'locES_challengeA_id',
        }),
      );
      const challengeB_data = {
        id: 'challengeB_id',
        skillId: 'skillId',
        competenceId: 'competence1',
        type: 'type challengeB',
        t1StatusAirtable: 'Désactivé',
        t1Status: false,
        t2StatusAirtable: 'Désactivé',
        t2Status: false,
        t3StatusAirtable: 'Activé',
        t3Status: true,
        status: Challenge.STATUSES.PROPOSE,
        embedUrl: 'embedUrl challengeB',
        embedHeight: null,
        timer: 145,
        format: Challenge.FORMATS.MOTS,
        autoReply: true,
        localesAirtable: ['Francophone'],
        locales: ['fr'],
        focusable: false,
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        pedagogy: Challenge.PEDAGOGIES.Q_SAVOIR,
        author: ['QWE'],
        declinable: Challenge.DECLINABLES.NON,
        version: 1,
        alternativeVersion: null,
        accessibility1: Challenge.ACCESSIBILITY1.OK,
        accessibility2: Challenge.ACCESSIBILITY2.OK,
        spoil: Challenge.SPOILS.FACILEMENT_SPOILABLE,
        responsive: Challenge.RESPONSIVES.TABLETTE,
        geography: 'FR',
        files: [],
        validatedAt: null,
        archivedAt: null,
        createdAt: '2025-10-23T10:19:00Z',
        madeObsoleteAt: null,
        updatedAt: '2025-10-23T10:20:00Z',
        shuffled: false,
        assessmentMaintenanceTags: [Challenge.ASSESSMENT_MAINTENANCE_TAGS.ENGLISH_WORD],
      };

      databaseBuilder.factory.buildChallenge(challengeB_data);

      const primaryLoc_challengeB_data = {
        embedUrl: 'embedUrl primaryloc challengeB',
        fileIds: [],
        locale: 'fr',
        status: null,
        geography: 'FR',
        urlsToConsult: ['http://primaryloc.challengeB'],
      };
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeB_id.instruction',
        locale: 'fr',
        value: 'instruction FR challengeB',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeB_id.proposals',
        locale: 'fr',
        value: 'proposals FR challengeB',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeB_id',
        challengeId: 'challengeB_id',
        ...primaryLoc_challengeB_data,
      });
      await databaseBuilder.commit();

      // when
      const challenges = await challengeRepository.listBySkillId('skillId');

      // then
      expect(challenges).toStrictEqual([
        domainBuilder.buildChallenge({
          accessibility1: challengeA_data.accessibility1,
          accessibility2: challengeA_data.accessibility2,
          alternativeVersion: challengeA_data.alternativeVersion,
          archivedAt: challengeA_data.archivedAt,
          assessmentMaintenanceTags: challengeA_data.assessmentMaintenanceTags,
          author: challengeA_data.author,
          autoReply: challengeA_data.autoReply,
          competenceId: challengeA_data.competenceId,
          createdAt: challengeA_data.createdAt,
          declinable: challengeA_data.declinable,
          embedHeight: challengeA_data.embedHeight,
          files: challengeA_data.files,
          focusable: challengeA_data.focusable,
          format: challengeA_data.format,
          genealogy: challengeA_data.genealogy,
          geography: challengeA_data.geography,
          id: challengeA_data.id,
          isQualityOk: challengeA_data.isQualityOk,
          locales: challengeA_data.locales,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({
              id: challengeA_data.localizedEsId,
              challengeId: challengeA_data.id,
              ...esLoc_challengeA_data,
            }),
            domainBuilder.buildLocalizedChallenge({
              id: challengeA_data.id,
              challengeId: challengeA_data.id,
              ...primaryLoc_challengeA_data,
            }),
          ],
          madeObsoleteAt: challengeA_data.madeObsoleteAt,
          pedagogy: challengeA_data.pedagogy,
          responsive: challengeA_data.responsive,
          shuffled: challengeA_data.shuffled,
          skillId: challengeA_data.skillId,
          spoil: challengeA_data.spoil,
          status: challengeA_data.status,
          t1Status: challengeA_data.t1Status,
          t2Status: challengeA_data.t2Status,
          t3Status: challengeA_data.t3Status,
          timer: challengeA_data.timer,
          translations: {
            fr: {
              instruction: 'instruction FR challengeA',
              solution: 'solution FR challengeA',
            },
            es: { instruction: 'instruction ES challengeA' },
          },
          type: challengeA_data.type,
          updatedAt: challengeA_data.updatedAt,
          validatedAt: challengeA_data.validatedAt,
          version: challengeA_data.version,
        }),
        domainBuilder.buildChallenge({
          accessibility1: challengeB_data.accessibility1,
          accessibility2: challengeB_data.accessibility2,
          alternativeVersion: challengeB_data.alternativeVersion,
          archivedAt: challengeB_data.archivedAt,
          assessmentMaintenanceTags: challengeB_data.assessmentMaintenanceTags,
          author: challengeB_data.author,
          autoReply: challengeB_data.autoReply,
          competenceId: challengeB_data.competenceId,
          createdAt: challengeB_data.createdAt,
          declinable: challengeB_data.declinable,
          embedHeight: challengeB_data.embedHeight,
          files: challengeB_data.files,
          focusable: challengeB_data.focusable,
          format: challengeB_data.format,
          genealogy: challengeB_data.genealogy,
          geography: challengeB_data.geography,
          id: challengeB_data.id,
          locales: challengeB_data.locales,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({
              id: challengeB_data.id,
              challengeId: challengeB_data.id,
              ...primaryLoc_challengeB_data,
            }),
          ],
          madeObsoleteAt: challengeB_data.madeObsoleteAt,
          pedagogy: challengeB_data.pedagogy,
          responsive: challengeB_data.responsive,
          shuffled: challengeB_data.shuffled,
          skillId: challengeB_data.skillId,
          spoil: challengeB_data.spoil,
          status: challengeB_data.status,
          t1Status: challengeB_data.t1Status,
          t2Status: challengeB_data.t2Status,
          t3Status: challengeB_data.t3Status,
          timer: challengeB_data.timer,
          translations: {
            fr: {
              instruction: 'instruction FR challengeB',
              proposals: 'proposals FR challengeB',
            },
          },
          type: challengeB_data.type,
          updatedAt: challengeB_data.updatedAt,
          validatedAt: challengeB_data.validatedAt,
          version: challengeB_data.version,
        }),
      ]);
    });

    it('should return an empty array when no challenges found for provided skill id', async () => {
      // when
      const challenges = await challengeRepository.listBySkillId('someSkillId');

      // then
      expect(challenges).toStrictEqual([]);
    });
  });

  describe('list', () => {
    it('should list all challenges', async () => {
      // given
      const challengeA_data = {
        id: 'challengeA_id',
        localizedEsId: 'locES_challengeA_id',
        skillId: 'skillId',
        competenceId: 'competence1',
        type: 'type challengeA',
        t1StatusAirtable: 'Activé',
        t1Status: true,
        t2StatusAirtable: 'Désactivé',
        t2Status: false,
        t3StatusAirtable: 'Activé',
        t3Status: true,
        status: Challenge.STATUSES.PROPOSE,
        embedUrl: 'embedUrl challengeA',
        embedHeight: 987,
        timer: 789,
        format: Challenge.FORMATS.MOTS,
        autoReply: false,
        localesAirtable: ['Francophone'],
        locales: ['fr'],
        focusable: true,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
        author: ['TRO'],
        declinable: Challenge.DECLINABLES.FACILEMENT,
        version: 2,
        alternativeVersion: 3,
        accessibility1: Challenge.ACCESSIBILITY1.KO,
        accessibility2: Challenge.ACCESSIBILITY2.RAS,
        spoil: Challenge.SPOILS.NON_SPOILABLE,
        responsive: Challenge.RESPONSIVES.SMARTPHONE,
        geography: 'FR',
        files: [{ fileId: 'attachmentA', localizedChallengeId: 'challengeA_id' }, { fileId: 'attachmentB', localizedChallengeId: 'locES_challengeA_id' }],
        validatedAt: null,
        archivedAt: null,
        createdAt: '2025-10-23T10:17:00Z',
        updatedAt: '2025-10-23T10:18:00Z',
        madeObsoleteAt: null,
        shuffled: false,
        assessmentMaintenanceTags: [Challenge.ASSESSMENT_MAINTENANCE_TAGS.LOCALIZED_URL],
      };

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: challengeA_data.skillId, tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(challengeA_data);

      const primaryLoc_challengeA_data = {
        embedUrl: 'embedUrl primaryloc challengeA',
        fileIds: ['attachmentA'],
        locale: 'fr',
        status: null,
        geography: 'FR',
        urlsToConsult: ['http://primaryloc.challengeA'],
      };
      const esLoc_challengeA_data = {
        embedUrl: 'embedUrl esLoc challengeA',
        fileIds: ['attachmentB'],
        locale: 'es',
        status: LocalizedChallenge.STATUSES.PAUSE,
        geography: 'ES',
        urlsToConsult: ['http://esLoc.challengeA'],
      };
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeA_id.instruction',
        locale: 'fr',
        value: 'instruction FR challengeA',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeA_id.instruction',
        locale: 'es',
        value: 'instruction ES challengeA',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeA_id.solution',
        locale: 'fr',
        value: 'solution FR challengeA',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeA_id',
        challengeId: 'challengeA_id',
        ...primaryLoc_challengeA_data,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'locES_challengeA_id',
        challengeId: 'challengeA_id',
        ...esLoc_challengeA_data,
      });
      databaseBuilder.factory.buildAttachment(
        domainBuilder.buildAttachmentDatasourceObject({
          id: 'attachmentA',
          challengeId: 'challengeA_id',
          localizedChallengeId: 'challengeA_id',
        }),
      );
      databaseBuilder.factory.buildAttachment(
        domainBuilder.buildAttachmentDatasourceObject({
          id: 'attachmentB',
          challengeId: 'challengeA_id',
          localizedChallengeId: 'locES_challengeA_id',
        }),
      );
      const challengeB_data = {
        id: 'challengeB_id',
        skillId: 'skillId',
        competenceId: 'competence1',
        type: 'type challengeB',
        t1StatusAirtable: 'Désactivé',
        t1Status: false,
        t2StatusAirtable: 'Désactivé',
        t2Status: false,
        t3StatusAirtable: 'Activé',
        t3Status: true,
        status: Challenge.STATUSES.PROPOSE,
        embedUrl: 'embedUrl challengeB',
        embedHeight: null,
        timer: 145,
        format: Challenge.FORMATS.MOTS,
        autoReply: true,
        localesAirtable: ['Francophone'],
        locales: ['fr'],
        focusable: false,
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        pedagogy: Challenge.PEDAGOGIES.Q_SAVOIR,
        author: ['QWE'],
        declinable: Challenge.DECLINABLES.NON,
        version: 1,
        alternativeVersion: null,
        accessibility1: Challenge.ACCESSIBILITY1.OK,
        accessibility2: Challenge.ACCESSIBILITY2.OK,
        spoil: Challenge.SPOILS.FACILEMENT_SPOILABLE,
        responsive: Challenge.RESPONSIVES.TABLETTE,
        geography: 'FR',
        files: [],
        validatedAt: null,
        archivedAt: null,
        createdAt: '2025-10-23T10:19:00Z',
        madeObsoleteAt: null,
        updatedAt: '2025-10-23T10:20:00Z',
        shuffled: false,
        assessmentMaintenanceTags: [Challenge.ASSESSMENT_MAINTENANCE_TAGS.LOCALIZED_URL],
      };

      databaseBuilder.factory.buildChallenge(challengeB_data);

      const primaryLoc_challengeB_data = {
        embedUrl: 'embedUrl primaryloc challengeB',
        fileIds: [],
        locale: 'fr',
        status: null,
        geography: 'FR',
        urlsToConsult: ['http://primaryloc.challengeB'],
      };
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeB_id.instruction',
        locale: 'fr',
        value: 'instruction FR challengeB',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeB_id.proposals',
        locale: 'fr',
        value: 'proposals FR challengeB',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeB_id',
        challengeId: 'challengeB_id',
        ...primaryLoc_challengeB_data,
      });
      await databaseBuilder.commit();

      // when
      const challenges = await challengeRepository.list();

      // then
      expect(challenges).toStrictEqual([
        domainBuilder.buildChallenge({
          accessibility1: challengeA_data.accessibility1,
          accessibility2: challengeA_data.accessibility2,
          alternativeVersion: challengeA_data.alternativeVersion,
          archivedAt: challengeA_data.archivedAt,
          assessmentMaintenanceTags: challengeA_data.assessmentMaintenanceTags,
          author: challengeA_data.author,
          autoReply: challengeA_data.autoReply,
          competenceId: challengeA_data.competenceId,
          createdAt: challengeA_data.createdAt,
          declinable: challengeA_data.declinable,
          embedHeight: challengeA_data.embedHeight,
          files: challengeA_data.files,
          focusable: challengeA_data.focusable,
          format: challengeA_data.format,
          genealogy: challengeA_data.genealogy,
          geography: challengeA_data.geography,
          id: challengeA_data.id,
          isQualityOk: challengeA_data.isQualityOk,
          locales: challengeA_data.locales,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({
              id: challengeA_data.localizedEsId,
              challengeId: challengeA_data.id,
              ...esLoc_challengeA_data,
            }),
            domainBuilder.buildLocalizedChallenge({
              id: challengeA_data.id,
              challengeId: challengeA_data.id,
              ...primaryLoc_challengeA_data,
            }),
          ],
          madeObsoleteAt: challengeA_data.madeObsoleteAt,
          pedagogy: challengeA_data.pedagogy,
          responsive: challengeA_data.responsive,
          shuffled: challengeA_data.shuffled,
          skillId: challengeA_data.skillId,
          spoil: challengeA_data.spoil,
          status: challengeA_data.status,
          t1Status: challengeA_data.t1Status,
          t2Status: challengeA_data.t2Status,
          t3Status: challengeA_data.t3Status,
          timer: challengeA_data.timer,
          translations: {
            fr: {
              instruction: 'instruction FR challengeA',
              solution: 'solution FR challengeA',
            },
            es: { instruction: 'instruction ES challengeA' },
          },
          type: challengeA_data.type,
          updatedAt: challengeA_data.updatedAt,
          validatedAt: challengeA_data.validatedAt,
          version: challengeA_data.version,
        }),
        domainBuilder.buildChallenge({
          accessibility1: challengeB_data.accessibility1,
          accessibility2: challengeB_data.accessibility2,
          alternativeVersion: challengeB_data.alternativeVersion,
          archivedAt: challengeB_data.archivedAt,
          assessmentMaintenanceTags: challengeB_data.assessmentMaintenanceTags,
          author: challengeB_data.author,
          autoReply: challengeB_data.autoReply,
          competenceId: challengeB_data.competenceId,
          createdAt: challengeB_data.createdAt,
          declinable: challengeB_data.declinable,
          embedHeight: challengeB_data.embedHeight,
          files: challengeB_data.files,
          focusable: challengeB_data.focusable,
          format: challengeB_data.format,
          genealogy: challengeB_data.genealogy,
          geography: challengeB_data.geography,
          id: challengeB_data.id,
          locales: challengeB_data.locales,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({
              id: challengeB_data.id,
              challengeId: challengeB_data.id,
              ...primaryLoc_challengeB_data,
            }),
          ],
          madeObsoleteAt: challengeB_data.madeObsoleteAt,
          pedagogy: challengeB_data.pedagogy,
          responsive: challengeB_data.responsive,
          shuffled: challengeB_data.shuffled,
          skillId: challengeB_data.skillId,
          spoil: challengeB_data.spoil,
          status: challengeB_data.status,
          t1Status: challengeB_data.t1Status,
          t2Status: challengeB_data.t2Status,
          t3Status: challengeB_data.t3Status,
          timer: challengeB_data.timer,
          translations: {
            fr: {
              instruction: 'instruction FR challengeB',
              proposals: 'proposals FR challengeB',
            },
          },
          type: challengeB_data.type,
          updatedAt: challengeB_data.updatedAt,
          validatedAt: challengeB_data.validatedAt,
          version: challengeB_data.version,
        }),
      ]);
    });
  });

  describe('#streamForReplication', () => {
    it('streams all challenges', async () => {
      // given
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });

      const challengeA_data = {
        id: 'challengeA_id',
        localizedEsId: 'locES_challengeA_id',
        skillId: 'skillId',
        competenceId: 'competence1',
        type: 'type challengeA',
        t1StatusAirtable: 'Activé',
        t1Status: true,
        t2StatusAirtable: 'Désactivé',
        t2Status: false,
        t3StatusAirtable: 'Activé',
        t3Status: true,
        status: Challenge.STATUSES.PROPOSE,
        embedUrl: 'embedUrl challengeA',
        embedHeight: 987,
        timer: 789,
        format: Challenge.FORMATS.MOTS,
        autoReply: false,
        localesAirtable: ['Francophone'],
        locales: ['fr'],
        focusable: true,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
        author: ['TRO'],
        declinable: Challenge.DECLINABLES.FACILEMENT,
        version: 2,
        alternativeVersion: 3,
        accessibility1: Challenge.ACCESSIBILITY1.KO,
        accessibility2: Challenge.ACCESSIBILITY2.RAS,
        spoil: Challenge.SPOILS.NON_SPOILABLE,
        responsive: Challenge.RESPONSIVES.SMARTPHONE,
        geography: 'FR',
        files: [{ fileId: 'attachmentA', localizedChallengeId: 'challengeA_id' }, { fileId: 'attachmentB', localizedChallengeId: 'locES_challengeA_id' }],
        validatedAt: null,
        archivedAt: null,
        createdAt: '2025-10-23T10:17:00Z',
        updatedAt: '2025-10-23T10:18:00Z',
        madeObsoleteAt: null,
        shuffled: false,
        assessmentMaintenanceTags: [Challenge.ASSESSMENT_MAINTENANCE_TAGS.HARD_CONTEXTUALIZATION_EMBED],
      };
      databaseBuilder.factory.buildSkill({ id: challengeA_data.skillId, tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(challengeA_data);

      const primaryLoc_challengeA_data = {
        embedUrl: 'embedUrl primaryloc challengeA',
        fileIds: ['attachmentA'],
        locale: 'fr',
        status: null,
        geography: 'FR',
        urlsToConsult: ['http://primaryloc.challengeA'],
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: true,
        noValidationNeeded: true,
      };
      const esLoc_challengeA_data = {
        embedUrl: 'embedUrl esLoc challengeA',
        fileIds: ['attachmentB'],
        locale: 'es',
        status: LocalizedChallenge.STATUSES.PAUSE,
        geography: 'ES',
        urlsToConsult: ['http://esLoc.challengeA'],
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: false,
        toRephrase: false,
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
      };
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeA_id.instruction',
        locale: 'fr',
        value: 'instruction FR challengeA',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeA_id.instruction',
        locale: 'es',
        value: 'instruction ES challengeA',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeA_id.solution',
        locale: 'fr',
        value: 'solution FR challengeA',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeA_id',
        challengeId: 'challengeA_id',
        ...primaryLoc_challengeA_data,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'locES_challengeA_id',
        challengeId: 'challengeA_id',
        ...esLoc_challengeA_data,
      });
      databaseBuilder.factory.buildAttachment(
        domainBuilder.buildAttachmentDatasourceObject({
          id: 'attachmentA',
          challengeId: 'challengeA_id',
          localizedChallengeId: 'challengeA_id',
        }),
      );
      databaseBuilder.factory.buildAttachment(
        domainBuilder.buildAttachmentDatasourceObject({
          id: 'attachmentB',
          challengeId: 'challengeA_id',
          localizedChallengeId: 'locES_challengeA_id',
        }),
      );

      const challengeB_data = {
        id: 'challengeB_id',
        skillId: 'skillId',
        competenceId: 'competence1',
        type: 'type challengeB',
        t1StatusAirtable: 'Désactivé',
        t1Status: false,
        t2StatusAirtable: 'Désactivé',
        t2Status: false,
        t3StatusAirtable: 'Activé',
        t3Status: true,
        status: Challenge.STATUSES.PROPOSE,
        embedUrl: 'embedUrl challengeB',
        embedHeight: null,
        timer: 145,
        format: Challenge.FORMATS.MOTS,
        autoReply: true,
        localesAirtable: ['Francophone'],
        locales: ['fr'],
        focusable: false,
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        pedagogy: Challenge.PEDAGOGIES.Q_SAVOIR,
        author: ['QWE'],
        declinable: Challenge.DECLINABLES.NON,
        version: 2,
        alternativeVersion: null,
        accessibility1: Challenge.ACCESSIBILITY1.OK,
        accessibility2: Challenge.ACCESSIBILITY2.OK,
        spoil: Challenge.SPOILS.FACILEMENT_SPOILABLE,
        responsive: Challenge.RESPONSIVES.TABLETTE,
        geography: 'FR',
        files: [],
        validatedAt: null,
        archivedAt: null,
        createdAt: '2025-10-23T10:19:00Z',
        madeObsoleteAt: null,
        updatedAt: '2025-10-23T10:20:00Z',
        shuffled: false,
      };
      databaseBuilder.factory.buildChallenge(challengeB_data);

      const primaryLoc_challengeB_data = {
        embedUrl: 'embedUrl primaryloc challengeB',
        fileIds: [],
        locale: 'fr',
        status: null,
        geography: 'FR',
        urlsToConsult: ['http://primaryloc.challengeB'],
        requireGafamWebsiteAccess: false,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: false,
        toRephrase: false,
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
      };
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeB_id.instruction',
        locale: 'fr',
        value: 'instruction FR challengeB',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeB_id.proposals',
        locale: 'fr',
        value: 'proposals FR challengeB',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeB_id',
        challengeId: 'challengeB_id',
        ...primaryLoc_challengeB_data,
      });
      await databaseBuilder.commit();

      // when
      const stream = challengeRepository.streamForReplication();
      const challenges = [];
      for await (const challenge of stream) {
        challenges.push(challenge);
      }

      // then
      expect(challenges).toStrictEqual([
        domainBuilder.buildChallenge({
          accessibility1: challengeA_data.accessibility1,
          accessibility2: challengeA_data.accessibility2,
          alternativeVersion: challengeA_data.alternativeVersion,
          archivedAt: challengeA_data.archivedAt,
          assessmentMaintenanceTags: challengeA_data.assessmentMaintenanceTags,
          author: challengeA_data.author,
          autoReply: challengeA_data.autoReply,
          competenceId: challengeA_data.competenceId,
          createdAt: challengeA_data.createdAt,
          declinable: challengeA_data.declinable,
          embedHeight: challengeA_data.embedHeight,
          files: challengeA_data.files,
          focusable: challengeA_data.focusable,
          format: challengeA_data.format,
          genealogy: challengeA_data.genealogy,
          geography: challengeA_data.geography,
          id: challengeA_data.id,
          isQualityOk: challengeA_data.isQualityOk,
          locales: challengeA_data.locales,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({
              id: challengeA_data.localizedEsId,
              challengeId: challengeA_data.id,
              ...esLoc_challengeA_data,
            }),
            domainBuilder.buildLocalizedChallenge({
              id: challengeA_data.id,
              challengeId: challengeA_data.id,
              ...primaryLoc_challengeA_data,
            }),
          ],
          madeObsoleteAt: challengeA_data.madeObsoleteAt,
          pedagogy: challengeA_data.pedagogy,
          responsive: challengeA_data.responsive,
          shuffled: challengeA_data.shuffled,
          skillId: challengeA_data.skillId,
          spoil: challengeA_data.spoil,
          status: challengeA_data.status,
          t1Status: challengeA_data.t1Status,
          t2Status: challengeA_data.t2Status,
          t3Status: challengeA_data.t3Status,
          timer: challengeA_data.timer,
          translations: {
            fr: {
              instruction: 'instruction FR challengeA',
              solution: 'solution FR challengeA',
            },
            es: { instruction: 'instruction ES challengeA' },
          },
          type: challengeA_data.type,
          updatedAt: challengeA_data.updatedAt,
          validatedAt: challengeA_data.validatedAt,
          version: challengeA_data.version,
        }),
        domainBuilder.buildChallenge({
          accessibility1: challengeA_data.accessibility1,
          accessibility2: challengeA_data.accessibility2,
          alternativeVersion: challengeB_data.alternativeVersion,
          archivedAt: challengeB_data.archivedAt,
          assessmentMaintenanceTags: challengeA_data.assessmentMaintenanceTags,
          author: challengeB_data.author,
          autoReply: challengeB_data.autoReply,
          competenceId: challengeB_data.competenceId,
          createdAt: challengeB_data.createdAt,
          declinable: challengeB_data.declinable,
          embedHeight: challengeB_data.embedHeight,
          files: challengeB_data.files,
          focusable: challengeB_data.focusable,
          format: challengeB_data.format,
          genealogy: challengeB_data.genealogy,
          geography: challengeB_data.geography,
          id: challengeB_data.id,
          locales: challengeB_data.locales,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({
              id: challengeB_data.id,
              challengeId: challengeB_data.id,
              ...primaryLoc_challengeB_data,
            }),
          ],
          madeObsoleteAt: challengeB_data.madeObsoleteAt,
          pedagogy: challengeB_data.pedagogy,
          prototypePrimaryLocalizedChallenge: {
            requireGafamWebsiteAccess: primaryLoc_challengeA_data.requireGafamWebsiteAccess,
            isIncompatibleIpadCertif: primaryLoc_challengeA_data.isIncompatibleIpadCertif,
            deafAndHardOfHearing: primaryLoc_challengeA_data.deafAndHardOfHearing,
            isAwarenessChallenge: primaryLoc_challengeA_data.isAwarenessChallenge,
            toRephrase: primaryLoc_challengeA_data.toRephrase,
            hasEmbedInternalValidation: primaryLoc_challengeA_data.hasEmbedInternalValidation,
            noValidationNeeded: primaryLoc_challengeA_data.noValidationNeeded,
          },
          responsive: challengeB_data.responsive,
          shuffled: challengeB_data.shuffled,
          skillId: challengeB_data.skillId,
          spoil: challengeB_data.spoil,
          status: challengeB_data.status,
          t1Status: challengeB_data.t1Status,
          t2Status: challengeB_data.t2Status,
          t3Status: challengeB_data.t3Status,
          timer: challengeB_data.timer,
          translations: {
            fr: {
              instruction: 'instruction FR challengeB',
              proposals: 'proposals FR challengeB',
            },
          },
          type: challengeB_data.type,
          updatedAt: challengeB_data.updatedAt,
          validatedAt: challengeB_data.validatedAt,
          version: challengeB_data.version,
        }),
      ]);
    });
  });

  describe('#listActiveOrDraftByCompetenceId', () => {
    it('should retrieve active & draft challenges by given competence id', async () => {
      // given
      const challengeDraftA_data = {
        id: 'challengeDraftA_id',
        localizedEsId: 'locES_challengeDraftA_id',
        skillId: 'skillId',
        competenceId: 'competence1',
        type: 'type challengeDraftA',
        t1StatusAirtable: 'Activé',
        t1Status: true,
        t2StatusAirtable: 'Désactivé',
        t2Status: false,
        t3StatusAirtable: 'Activé',
        t3Status: true,
        status: Challenge.STATUSES.PROPOSE,
        embedUrl: 'embedUrl challengeDraftA',
        embedHeight: 987,
        timer: 789,
        format: Challenge.FORMATS.MOTS,
        autoReply: false,
        localesAirtable: ['Francophone'],
        locales: ['fr'],
        focusable: true,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
        author: ['ASD'],
        declinable: Challenge.DECLINABLES.FACILEMENT,
        version: 2,
        alternativeVersion: 3,
        accessibility1: Challenge.ACCESSIBILITY1.KO,
        accessibility2: Challenge.ACCESSIBILITY2.RAS,
        spoil: Challenge.SPOILS.NON_SPOILABLE,
        responsive: Challenge.RESPONSIVES.SMARTPHONE,
        geography: 'FR',
        files: [{ fileId: 'attachmentDraftA', localizedChallengeId: 'challengeDraftA_id' }, { fileId: 'attachmentDraftB', localizedChallengeId: 'locES_challengeDraftA_id' }],
        validatedAt: null,
        archivedAt: null,
        createdAt: '2025-10-23T10:17:00Z',
        updatedAt: '2025-10-23T10:18:00Z',
        madeObsoleteAt: null,
        shuffled: true,
        assessmentMaintenanceTags: [Challenge.ASSESSMENT_MAINTENANCE_TAGS.FILE_TO_REDO],
      };

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: challengeDraftA_data.skillId, tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(challengeDraftA_data);

      const challengeActiveA_data = {
        id: 'challengeActiveA_id',
        skillId: 'skillId',
        competenceId: 'competence1',
        type: 'type challengeA',
        t1StatusAirtable: 'Activé',
        t1Status: true,
        t2StatusAirtable: 'Désactivé',
        t2Status: false,
        t3StatusAirtable: 'Activé',
        t3Status: true,
        status: Challenge.STATUSES.VALIDE,
        embedUrl: 'embedUrl challengeActiveA',
        embedHeight: null,
        timer: 789,
        format: Challenge.FORMATS.MOTS,
        autoReply: false,
        localesAirtable: ['Francophone'],
        locales: ['fr'],
        focusable: false,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
        author: ['QWE'],
        declinable: Challenge.DECLINABLES.FACILEMENT,
        version: 1,
        alternativeVersion: null,
        accessibility1: Challenge.ACCESSIBILITY1.KO,
        accessibility2: Challenge.ACCESSIBILITY2.RAS,
        spoil: Challenge.SPOILS.NON_SPOILABLE,
        responsive: Challenge.RESPONSIVES.SMARTPHONE,
        geography: 'FR',
        files: [],
        validatedAt: null,
        archivedAt: null,
        createdAt: '2025-10-23T10:19:00Z',
        updatedAt: '2025-10-23T10:20:00Z',
        madeObsoleteAt: null,
        shuffled: false,
        assessmentMaintenanceTags: [Challenge.ASSESSMENT_MAINTENANCE_TAGS.FILE_TO_REDO],
      };

      databaseBuilder.factory.buildChallenge(challengeActiveA_data);

      const primaryLoc_challengeDraftA_data = {
        embedUrl: 'embedUrl primaryloc challengeA',
        fileIds: ['attachmentDraftA'],
        locale: 'fr',
        status: null,
        geography: 'FR',
        urlsToConsult: ['http://primaryloc.challengeA'],
      };
      const primaryLoc_challengeActiveA_data = {
        embedUrl: 'embedUrl primaryloc challengeActiveA',
        fileIds: [],
        locale: 'fr',
        status: null,
        geography: 'FR',
        urlsToConsult: ['http://primaryloc.challengeActiveA'],
      };
      const esLoc_challengeDraftA_data = {
        embedUrl: 'embedUrl esLoc challengeDraftA',
        fileIds: ['attachmentDraftB'],
        locale: 'es',
        status: LocalizedChallenge.STATUSES.PAUSE,
        geography: 'ES',
        urlsToConsult: ['http://esLoc.challengeA'],
      };
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeDraftA_id.instruction',
        locale: 'fr',
        value: 'instruction FR challengeDraftA',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeDraftA_id.instruction',
        locale: 'es',
        value: 'instruction ES challengeDraftA',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeDraftA_id.solution',
        locale: 'fr',
        value: 'solution FR challengeDraftA',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeActiveA_id.instruction',
        locale: 'fr',
        value: 'instruction FR challengeActiveA',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeActiveA_id.solution',
        locale: 'fr',
        value: 'solution FR challengeActiveA',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeDraftA_id',
        challengeId: 'challengeDraftA_id',
        ...primaryLoc_challengeDraftA_data,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'locES_challengeDraftA_id',
        challengeId: 'challengeDraftA_id',
        ...esLoc_challengeDraftA_data,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeActiveA_id',
        challengeId: 'challengeActiveA_id',
        ...primaryLoc_challengeActiveA_data,
      });
      databaseBuilder.factory.buildAttachment(
        domainBuilder.buildAttachmentDatasourceObject({
          id: 'attachmentDraftA',
          challengeId: 'challengeDraftA_id',
          localizedChallengeId: 'challengeDraftA_id',
        }),
      );
      databaseBuilder.factory.buildAttachment(
        domainBuilder.buildAttachmentDatasourceObject({
          id: 'attachmentDraftB',
          challengeId: 'challengeDraftA_id',
          localizedChallengeId: 'locES_challengeDraftA_id',
        }),
      );
      await databaseBuilder.commit();

      // when
      const challenges = await challengeRepository.listActiveOrDraftByCompetenceId(challengeDraftA_data.competenceId);

      // then
      expect(challenges).toStrictEqual([
        domainBuilder.buildChallenge({
          accessibility1: challengeActiveA_data.accessibility1,
          accessibility2: challengeActiveA_data.accessibility2,
          alternativeVersion: challengeActiveA_data.alternativeVersion,
          archivedAt: challengeActiveA_data.archivedAt,
          assessmentMaintenanceTags: challengeActiveA_data.assessmentMaintenanceTags,
          author: challengeActiveA_data.author,
          autoReply: challengeActiveA_data.autoReply,
          competenceId: challengeActiveA_data.competenceId,
          createdAt: challengeActiveA_data.createdAt,
          declinable: challengeActiveA_data.declinable,
          embedHeight: challengeActiveA_data.embedHeight,
          files: challengeActiveA_data.files,
          focusable: challengeActiveA_data.focusable,
          format: challengeActiveA_data.format,
          genealogy: challengeActiveA_data.genealogy,
          geography: challengeActiveA_data.geography,
          id: challengeActiveA_data.id,
          locales: challengeActiveA_data.locales,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({
              id: challengeActiveA_data.id,
              challengeId: challengeActiveA_data.id,
              ...primaryLoc_challengeActiveA_data,
            }),
          ],
          madeObsoleteAt: challengeActiveA_data.madeObsoleteAt,
          pedagogy: challengeActiveA_data.pedagogy,
          responsive: challengeActiveA_data.responsive,
          shuffled: challengeActiveA_data.shuffled,
          skillId: challengeActiveA_data.skillId,
          spoil: challengeActiveA_data.spoil,
          status: challengeActiveA_data.status,
          t1Status: challengeActiveA_data.t1Status,
          t2Status: challengeActiveA_data.t2Status,
          t3Status: challengeActiveA_data.t3Status,
          timer: challengeActiveA_data.timer,
          translations: {
            fr: {
              instruction: 'instruction FR challengeActiveA',
              solution: 'solution FR challengeActiveA',
            },
          },
          type: challengeActiveA_data.type,
          updatedAt: challengeActiveA_data.updatedAt,
          validatedAt: challengeActiveA_data.validatedAt,
          version: challengeActiveA_data.version,
        }),
        domainBuilder.buildChallenge({
          accessibility1: challengeDraftA_data.accessibility1,
          accessibility2: challengeDraftA_data.accessibility2,
          alternativeVersion: challengeDraftA_data.alternativeVersion,
          archivedAt: challengeDraftA_data.archivedAt,
          assessmentMaintenanceTags: challengeDraftA_data.assessmentMaintenanceTags,
          author: challengeDraftA_data.author,
          autoReply: challengeDraftA_data.autoReply,
          competenceId: challengeDraftA_data.competenceId,
          createdAt: challengeDraftA_data.createdAt,
          declinable: challengeDraftA_data.declinable,
          embedHeight: challengeDraftA_data.embedHeight,
          files: challengeDraftA_data.files,
          focusable: challengeDraftA_data.focusable,
          format: challengeDraftA_data.format,
          genealogy: challengeDraftA_data.genealogy,
          geography: challengeDraftA_data.geography,
          id: challengeDraftA_data.id,
          locales: challengeDraftA_data.locales,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({
              id: challengeDraftA_data.localizedEsId,
              challengeId: challengeDraftA_data.id,
              ...esLoc_challengeDraftA_data,
            }),
            domainBuilder.buildLocalizedChallenge({
              id: challengeDraftA_data.id,
              challengeId: challengeDraftA_data.id,
              ...primaryLoc_challengeDraftA_data,
            }),
          ],
          madeObsoleteAt: challengeDraftA_data.madeObsoleteAt,
          pedagogy: challengeDraftA_data.pedagogy,
          responsive: challengeDraftA_data.responsive,
          shuffled: challengeDraftA_data.shuffled,
          skillId: challengeDraftA_data.skillId,
          spoil: challengeDraftA_data.spoil,
          status: challengeDraftA_data.status,
          t1Status: challengeDraftA_data.t1Status,
          t2Status: challengeDraftA_data.t2Status,
          t3Status: challengeDraftA_data.t3Status,
          timer: challengeDraftA_data.timer,
          translations: {
            fr: {
              instruction: 'instruction FR challengeDraftA',
              solution: 'solution FR challengeDraftA',
            },
            es: { instruction: 'instruction ES challengeDraftA' },
          },
          type: challengeDraftA_data.type,
          updatedAt: challengeDraftA_data.updatedAt,
          validatedAt: challengeDraftA_data.validatedAt,
          version: challengeDraftA_data.version,
        }),
      ]);
    });

    it('should return an empty array when no challenges found for provided competence id', async () => {
      // when
      const challenges = await challengeRepository.listActiveOrDraftByCompetenceId('someCompetenceId');

      // then
      expect(challenges).toStrictEqual([]);
    });
  });

  describe('#listPrototypesByCompetenceId', () => {
    it('should retrieve prototypes by given competence id', async () => {
      // given
      const challengeProtoA_data = {
        id: 'challengeProtoA_id',
        localizedEsId: 'locES_challengeProtoA_id',
        skillId: 'skillId',
        competenceId: 'competence1',
        type: 'type challengeProtoA',
        t1StatusAirtable: 'Activé',
        t1Status: true,
        t2StatusAirtable: 'Désactivé',
        t2Status: false,
        t3StatusAirtable: 'Activé',
        t3Status: true,
        status: Challenge.STATUSES.PROPOSE,
        embedUrl: 'embedUrl challengeProtoA',
        embedHeight: 987,
        timer: 789,
        format: Challenge.FORMATS.MOTS,
        autoReply: false,
        localesAirtable: ['Francophone'],
        locales: ['fr'],
        focusable: true,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
        author: ['ASD'],
        declinable: Challenge.DECLINABLES.FACILEMENT,
        version: 3,
        alternativeVersion: 2,
        accessibility1: Challenge.ACCESSIBILITY1.KO,
        accessibility2: Challenge.ACCESSIBILITY2.RAS,
        spoil: Challenge.SPOILS.NON_SPOILABLE,
        responsive: Challenge.RESPONSIVES.SMARTPHONE,
        geography: 'FR',
        files: ['attachmentProtoA'],
        filesLocalizedChallengeIds: ['challengeProtoA_id'],
        validatedAt: null,
        archivedAt: null,
        createdAt: '2025-10-23T10:17:00Z',
        updatedAt: '2025-10-23T10:18:00Z',
        madeObsoleteAt: null,
        shuffled: true,
        assessmentMaintenanceTags: [Challenge.ASSESSMENT_MAINTENANCE_TAGS.FILE_TO_REDO],
      };

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: challengeProtoA_data.skillId, tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(challengeProtoA_data);

      const challengeProtoB_data = {
        id: 'challengeProtoB_id',
        skillId: 'skillId',
        competenceId: 'competence1',
        type: 'type challengeProtoB',
        t1StatusAirtable: 'Activé',
        t1Status: true,
        t2StatusAirtable: 'Désactivé',
        t2Status: false,
        t3StatusAirtable: 'Activé',
        t3Status: true,
        status: Challenge.STATUSES.VALIDE,
        embedUrl: 'embedUrl challengeProtoB',
        embedHeight: null,
        timer: 789,
        format: Challenge.FORMATS.MOTS,
        autoReply: false,
        localesAirtable: ['Francophone'],
        locales: ['fr'],
        focusable: false,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
        author: ['QWE'],
        declinable: Challenge.DECLINABLES.FACILEMENT,
        version: 1,
        alternativeVersion: null,
        accessibility1: Challenge.ACCESSIBILITY1.KO,
        accessibility2: Challenge.ACCESSIBILITY2.RAS,
        spoil: Challenge.SPOILS.NON_SPOILABLE,
        responsive: Challenge.RESPONSIVES.SMARTPHONE,
        geography: 'FR',
        files: [],
        validatedAt: null,
        archivedAt: null,
        createdAt: '2025-10-23T10:19:00Z',
        updatedAt: '2025-10-23T10:20:00Z',
        madeObsoleteAt: null,
        shuffled: false,
        assessmentMaintenanceTags: [Challenge.ASSESSMENT_MAINTENANCE_TAGS.FILE_TO_REDO],
      };

      databaseBuilder.factory.buildChallenge(challengeProtoB_data);

      const primaryLoc_ProtoA_data = {
        embedUrl: 'embedUrl primaryloc challengeA',
        fileIds: ['attachmentProtoA'],
        locale: 'fr',
        status: null,
        geography: 'FR',
        urlsToConsult: ['http://primaryloc.challengeA'],
      };
      const primaryLoc_ProtoB_data = {
        embedUrl: 'embedUrl primaryloc challengeProtoB',
        fileIds: [],
        locale: 'fr',
        status: null,
        geography: 'FR',
        urlsToConsult: ['http://primaryloc.challengeProtoB'],
      };
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeProtoA_id.instruction',
        locale: 'fr',
        value: 'instruction FR challengeProtoA',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeProtoA_id.solution',
        locale: 'fr',
        value: 'solution FR challengeProtoA',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeProtoB_id.instruction',
        locale: 'fr',
        value: 'instruction FR challengeProtoB',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'challenge.challengeProtoB_id.solution',
        locale: 'fr',
        value: 'solution FR challengeProtoB',
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeProtoA_id',
        challengeId: 'challengeProtoA_id',
        ...primaryLoc_ProtoA_data,
      });
      databaseBuilder.factory.buildLocalizedChallenge({
        id: 'challengeProtoB_id',
        challengeId: 'challengeProtoB_id',
        ...primaryLoc_ProtoB_data,
      });
      databaseBuilder.factory.buildAttachment(
        domainBuilder.buildAttachmentDatasourceObject({
          id: 'attachmentProtoA',
          challengeId: 'challengeProtoA_id',
          localizedChallengeId: 'challengeProtoA_id',
        }),
      );
      await databaseBuilder.commit();

      // when
      const challenges = await challengeRepository.listPrototypesByCompetenceId(challengeProtoA_data.competenceId);

      // then
      expect(challenges).toStrictEqual([
        domainBuilder.buildChallenge({
          accessibility1: challengeProtoA_data.accessibility1,
          accessibility2: challengeProtoA_data.accessibility2,
          alternativeVersion: challengeProtoA_data.alternativeVersion,
          archivedAt: challengeProtoA_data.archivedAt,
          author: challengeProtoA_data.author,
          assessmentMaintenanceTags: challengeProtoA_data.assessmentMaintenanceTags,
          autoReply: challengeProtoA_data.autoReply,
          competenceId: challengeProtoA_data.competenceId,
          createdAt: challengeProtoA_data.createdAt,
          declinable: challengeProtoA_data.declinable,
          embedHeight: challengeProtoA_data.embedHeight,
          files: [{ fileId: 'attachmentProtoA', localizedChallengeId: 'challengeProtoA_id' }],
          focusable: challengeProtoA_data.focusable,
          format: challengeProtoA_data.format,
          genealogy: challengeProtoA_data.genealogy,
          geography: challengeProtoA_data.geography,
          id: challengeProtoA_data.id,
          locales: challengeProtoA_data.locales,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({
              id: challengeProtoA_data.id,
              challengeId: challengeProtoA_data.id,
              ...primaryLoc_ProtoA_data,
            }),
          ],
          madeObsoleteAt: challengeProtoA_data.madeObsoleteAt,
          pedagogy: challengeProtoA_data.pedagogy,
          responsive: challengeProtoA_data.responsive,
          shuffled: challengeProtoA_data.shuffled,
          skillId: challengeProtoA_data.skillId,
          spoil: challengeProtoA_data.spoil,
          status: challengeProtoA_data.status,
          t1Status: challengeProtoA_data.t1Status,
          t2Status: challengeProtoA_data.t2Status,
          t3Status: challengeProtoA_data.t3Status,
          timer: challengeProtoA_data.timer,
          translations: {
            fr: {
              instruction: 'instruction FR challengeProtoA',
              solution: 'solution FR challengeProtoA',
            },
          },
          type: challengeProtoA_data.type,
          updatedAt: challengeProtoA_data.updatedAt,
          validatedAt: challengeProtoA_data.validatedAt,
          version: challengeProtoA_data.version,
        }),
        domainBuilder.buildChallenge({
          accessibility1: challengeProtoB_data.accessibility1,
          accessibility2: challengeProtoB_data.accessibility2,
          alternativeVersion: challengeProtoB_data.alternativeVersion,
          archivedAt: challengeProtoB_data.archivedAt,
          assessmentMaintenanceTags: challengeProtoB_data.assessmentMaintenanceTags,
          author: challengeProtoB_data.author,
          autoReply: challengeProtoB_data.autoReply,
          competenceId: challengeProtoB_data.competenceId,
          createdAt: challengeProtoB_data.createdAt,
          declinable: challengeProtoB_data.declinable,
          embedHeight: challengeProtoB_data.embedHeight,
          files: challengeProtoB_data.files,
          focusable: challengeProtoB_data.focusable,
          format: challengeProtoB_data.format,
          genealogy: challengeProtoB_data.genealogy,
          geography: challengeProtoB_data.geography,
          id: challengeProtoB_data.id,
          locales: challengeProtoB_data.locales,
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({
              id: challengeProtoB_data.id,
              challengeId: challengeProtoB_data.id,
              ...primaryLoc_ProtoB_data,
            }),
          ],
          madeObsoleteAt: challengeProtoB_data.madeObsoleteAt,
          pedagogy: challengeProtoB_data.pedagogy,
          responsive: challengeProtoB_data.responsive,
          shuffled: challengeProtoB_data.shuffled,
          skillId: challengeProtoB_data.skillId,
          spoil: challengeProtoB_data.spoil,
          status: challengeProtoB_data.status,
          t1Status: challengeProtoB_data.t1Status,
          t2Status: challengeProtoB_data.t2Status,
          t3Status: challengeProtoB_data.t3Status,
          timer: challengeProtoB_data.timer,
          translations: {
            fr: {
              instruction: 'instruction FR challengeProtoB',
              solution: 'solution FR challengeProtoB',
            },
          },
          type: challengeProtoB_data.type,
          updatedAt: challengeProtoB_data.updatedAt,
          validatedAt: challengeProtoB_data.validatedAt,
          version: challengeProtoB_data.version,
        }),
      ]);
    });

    it('should return an empty array when no challenges found for provided competence id', async () => {
      // when
      const challenges = await challengeRepository.listActiveOrDraftByCompetenceId('someCompetenceId');

      // then
      expect(challenges).toStrictEqual([]);
    });
  });

  describe('#createBatch', () => {
    it('should create several challenges and its localized challenges and translations in PG', async () => {
      // given
      const primaryLocalizedChallenge_challengeA = domainBuilder.buildLocalizedChallenge({
        id: 'challengeA_id',
        challengeId: 'challengeA_id',
        embedUrl: 'https://challengeA_id.embedUrl.html',
        fileIds: ['ignored'],
        locale: 'fr',
        status: null,
        geography: 'FR',
        urlsToConsult: ['http://challengeA_id.urlToConsult.com'],
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: true,
        noValidationNeeded: true,
      });
      const localizedChallengeNL_challengeA = domainBuilder.buildLocalizedChallenge({
        id: 'localizedChallengeNL_challengeA_id',
        challengeId: 'challengeA_id',
        embedUrl: 'https://localizedChallengeNL_challengeA_id.embedUrl.html',
        fileIds: ['ignored'],
        locale: 'nl',
        status: LocalizedChallenge.STATUSES.PLAY,
        geography: 'NL',
        urlsToConsult: ['http://localizedChallengeNL_challengeA_id.urlToConsult.com'],
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: false,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
        isAwarenessChallenge: true,
        toRephrase: false,
        hasEmbedInternalValidation: true,
        noValidationNeeded: false,
      });
      const challengeA_data = {
        id: 'challengeA_id',
        accessibility1: Challenge.ACCESSIBILITY1.KO,
        accessibility2: Challenge.ACCESSIBILITY1.KO,
        alternativeVersion: 1,
        archivedAt: null,
        assessmentMaintenanceTags: [Challenge.ASSESSMENT_MAINTENANCE_TAGS.NAME],
        createdAt: null,
        validatedAt: null,
        madeObsoleteAt: null,
        updatedAt: null,
        author: ['MOI'],
        autoReply: true,
        competenceId: 'Unused competenceId',
        declinable: Challenge.DECLINABLES.FACILEMENT,
        embedHeight: 666,
        files: [],
        focusable: true,
        format: Challenge.FORMATS.MOTS,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        geography: 'FR',
        locales: ['fr'],
        localesAirtable: ['Francophone'],
        pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
        responsive: Challenge.RESPONSIVES.SMARTPHONE,
        shuffled: false,
        skillId: 'skillId1',
        spoil: Challenge.SPOILS.NON_SPOILABLE,
        status: Challenge.STATUSES.PROPOSE,
        isQualityOk: false,
        t1Status: false,
        t1StatusAirtable: 'Désactivé',
        t2Status: false,
        t2StatusAirtable: 'Désactivé',
        t3Status: true,
        t3StatusAirtable: 'Activé',
        timer: 123,
        type: 'type challengeA',
        version: 4,
      };
      const challengeA = domainBuilder.buildChallenge({
        ...challengeA_data,
        localizedChallenges: [primaryLocalizedChallenge_challengeA, localizedChallengeNL_challengeA],
        translations: {
          fr: {
            instruction: 'instruction FR challengeA',
            solution: 'solution FR challengeA',
          },
          nl: { instruction: 'instruction NL challengeA' },
        },
      });
      const primaryLocalizedChallenge_challengeB = domainBuilder.buildLocalizedChallenge({
        id: 'challengeB_id',
        challengeId: 'challengeB_id',
        embedUrl: 'https://challengeB_id.embedUrl.html',
        fileIds: ['ignored'],
        locale: 'fr',
        status: null,
        geography: 'FR',
        urlsToConsult: ['http://challengeB_id.urlToConsult.com'],
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: false,
        toRephrase: false,
        hasEmbedInternalValidation: false,
        noValidationNeeded: false,
        validatedAt: null,
      });
      const challengeB_data = {
        id: 'challengeB_id',
        accessibility1: Challenge.ACCESSIBILITY1.OK,
        accessibility2: Challenge.ACCESSIBILITY1.OK,
        alternativeVersion: 3,
        archivedAt: null,
        assessmentMaintenanceTags: [Challenge.ASSESSMENT_MAINTENANCE_TAGS.NAME],
        createdAt: null,
        validatedAt: null,
        madeObsoleteAt: null,
        updatedAt: null,
        author: ['LUI'],
        autoReply: false,
        competenceId: 'Unused competenceId',
        declinable: Challenge.DECLINABLES.NON,
        embedHeight: 777,
        files: [],
        focusable: false,
        format: Challenge.FORMATS.MOTS,
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        geography: 'FR',
        locales: ['fr'],
        localesAirtable: ['Francophone'],
        pedagogy: Challenge.PEDAGOGIES.Q_SAVOIR,
        responsive: Challenge.RESPONSIVES.TABLETTE,
        shuffled: true,
        skillId: 'skillId2',
        spoil: Challenge.SPOILS.FACILEMENT_SPOILABLE,
        status: Challenge.STATUSES.VALIDE,
        isQualityOk: false,
        t1Status: true,
        t1StatusAirtable: 'Activé',
        t2Status: true,
        t2StatusAirtable: 'Activé',
        t3Status: true,
        t3StatusAirtable: 'Activé',
        timer: 789,
        type: 'type challengeB',
        version: 2,
      };
      const challengeB = domainBuilder.buildChallenge({
        ...challengeB_data,
        localizedChallenges: [primaryLocalizedChallenge_challengeB],
        translations: {
          fr: {
            instruction: 'instruction FR challengeB',
            proposals: 'proposals FR challengeB',
          },
        },
      });

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: challengeA_data.skillId, tubeId: 'tube1' });
      databaseBuilder.factory.buildSkill({ id: challengeB_data.skillId, tubeId: 'tube1' });
      await databaseBuilder.commit();

      // when
      const challenges = await challengeRepository.createBatch([challengeA, challengeB]);

      // then
      expect(challenges).toStrictEqual([
        domainBuilder.buildChallenge({
          accessibility1: challengeA_data.accessibility1,
          accessibility2: challengeA_data.accessibility2,
          alternativeVersion: challengeA_data.alternativeVersion,
          archivedAt: challengeA_data.archivedAt,
          assessmentMaintenanceTags: challengeA_data.assessmentMaintenanceTags,
          author: challengeA_data.author,
          autoReply: challengeA_data.autoReply,
          competenceId: 'competence1',
          createdAt: expect.any(Date),
          declinable: challengeA_data.declinable,
          embedHeight: challengeA_data.embedHeight,
          files: challengeA_data.files,
          focusable: challengeA_data.focusable,
          format: challengeA_data.format,
          genealogy: challengeA_data.genealogy,
          geography: challengeA_data.geography,
          id: challengeA_data.id,
          isQualityOk: challengeA_data.isQualityOk,
          locales: challengeA_data.locales,
          localizedChallenges: challengeA.localizedChallenges,
          madeObsoleteAt: challengeA_data.madeObsoleteAt,
          pedagogy: challengeA_data.pedagogy,
          responsive: challengeA_data.responsive,
          shuffled: challengeA_data.shuffled,
          skillId: challengeA_data.skillId,
          spoil: challengeA_data.spoil,
          status: challengeA_data.status,
          t1Status: challengeA_data.t1Status,
          t2Status: challengeA_data.t2Status,
          t3Status: challengeA_data.t3Status,
          timer: challengeA_data.timer,
          translations: challengeA.translations,
          type: challengeA_data.type,
          updatedAt: expect.any(Date),
          validatedAt: challengeA_data.validatedAt,
          version: challengeA_data.version,
        }),
        domainBuilder.buildChallenge({
          accessibility1: challengeB_data.accessibility1,
          accessibility2: challengeB_data.accessibility2,
          alternativeVersion: challengeB_data.alternativeVersion,
          archivedAt: challengeB_data.archivedAt,
          assessmentMaintenanceTags: challengeB_data.assessmentMaintenanceTags,
          author: challengeB_data.author,
          autoReply: challengeB_data.autoReply,
          competenceId: 'competence1',
          createdAt: expect.any(Date),
          declinable: challengeB_data.declinable,
          embedHeight: challengeB_data.embedHeight,
          files: challengeB_data.files,
          focusable: challengeB_data.focusable,
          format: challengeB_data.format,
          genealogy: challengeB_data.genealogy,
          geography: challengeB_data.geography,
          id: challengeB_data.id,
          locales: challengeB_data.locales,
          localizedChallenges: challengeB.localizedChallenges,
          madeObsoleteAt: challengeB_data.madeObsoleteAt,
          pedagogy: challengeB_data.pedagogy,
          responsive: challengeB_data.responsive,
          shuffled: challengeB_data.shuffled,
          skillId: challengeB_data.skillId,
          spoil: challengeB_data.spoil,
          status: challengeB_data.status,
          t1Status: challengeB_data.t1Status,
          t2Status: challengeB_data.t2Status,
          t3Status: challengeB_data.t3Status,
          timer: challengeB_data.timer,
          translations: challengeB.translations,
          type: challengeB_data.type,
          updatedAt: expect.any(Date),
          validatedAt: challengeB_data.validatedAt,
          version: challengeB_data.version,
        }),
      ]);
      const allLocalizedChallenges = await knex('localized_challenges').select('*').orderBy(['challengeId', 'id']);
      expect(allLocalizedChallenges).toStrictEqual([
        {
          id: challengeA_data.id,
          challengeId: challengeA_data.id,
          embedUrl: primaryLocalizedChallenge_challengeA.embedUrl,
          locale: primaryLocalizedChallenge_challengeA.locale,
          status: primaryLocalizedChallenge_challengeA.status,
          geography: primaryLocalizedChallenge_challengeA.geography,
          urlsToConsult: primaryLocalizedChallenge_challengeA.urlsToConsult,
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
          isAwarenessChallenge: true,
          toRephrase: true,
          hasEmbedInternalValidation: true,
          noValidationNeeded: true,
          validatedAt: null,
        },
        {
          id: localizedChallengeNL_challengeA.id,
          challengeId: challengeA_data.id,
          embedUrl: localizedChallengeNL_challengeA.embedUrl,
          locale: localizedChallengeNL_challengeA.locale,
          status: localizedChallengeNL_challengeA.status,
          geography: localizedChallengeNL_challengeA.geography,
          urlsToConsult: localizedChallengeNL_challengeA.urlsToConsult,
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: false,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.RAS,
          isAwarenessChallenge: true,
          toRephrase: false,
          hasEmbedInternalValidation: true,
          noValidationNeeded: false,
          validatedAt: null,
        },
        {
          id: challengeB_data.id,
          challengeId: challengeB_data.id,
          embedUrl: primaryLocalizedChallenge_challengeB.embedUrl,
          locale: primaryLocalizedChallenge_challengeB.locale,
          status: primaryLocalizedChallenge_challengeB.status,
          geography: primaryLocalizedChallenge_challengeB.geography,
          urlsToConsult: primaryLocalizedChallenge_challengeB.urlsToConsult,
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
          isAwarenessChallenge: false,
          toRephrase: false,
          hasEmbedInternalValidation: false,
          noValidationNeeded: false,
          validatedAt: null,
        },
      ]);
      await expect(knex.select('*').from('challenges').orderBy('id')).resolves.toStrictEqual([
        {
          accessibility1: challengeA_data.accessibility1,
          accessibility2: challengeA_data.accessibility2,
          alternativeVersion: challengeA_data.alternativeVersion,
          archivedAt: challengeA_data.archivedAt,
          assessmentMaintenanceTags: challengeA_data.assessmentMaintenanceTags,
          author: challengeA_data.author,
          autoReply: challengeA_data.autoReply,
          createdAt: expect.any(Date),
          declinable: challengeA_data.declinable,
          embedHeight: challengeA_data.embedHeight,
          focusable: challengeA_data.focusable,
          format: challengeA_data.format,
          genealogy: challengeA_data.genealogy,
          id: challengeA_data.id,
          isQualityOk: challengeA_data.isQualityOk,
          locales: challengeA_data.locales,
          madeObsoleteAt: challengeA_data.madeObsoleteAt,
          pedagogy: challengeA_data.pedagogy,
          responsive: challengeA_data.responsive,
          shuffled: challengeA_data.shuffled,
          skillId: challengeA_data.skillId,
          spoil: challengeA_data.spoil,
          status: challengeA_data.status,
          t1Status: challengeA_data.t1Status,
          t2Status: challengeA_data.t2Status,
          t3Status: challengeA_data.t3Status,
          timer: challengeA_data.timer,
          type: challengeA_data.type,
          updatedAt: expect.any(Date),
          validatedAt: challengeA_data.validatedAt,
          version: challengeA_data.version,
        },
        {
          accessibility1: challengeB_data.accessibility1,
          accessibility2: challengeB_data.accessibility2,
          alternativeVersion: challengeB_data.alternativeVersion,
          archivedAt: challengeB_data.archivedAt,
          assessmentMaintenanceTags: challengeB_data.assessmentMaintenanceTags,
          author: challengeB_data.author,
          autoReply: challengeB_data.autoReply,
          createdAt: expect.any(Date),
          declinable: challengeB_data.declinable,
          embedHeight: challengeB_data.embedHeight,
          focusable: challengeB_data.focusable,
          format: challengeB_data.format,
          genealogy: challengeB_data.genealogy,
          id: challengeB_data.id,
          isQualityOk: challengeB_data.isQualityOk,
          locales: challengeB_data.locales,
          madeObsoleteAt: challengeB_data.madeObsoleteAt,
          pedagogy: challengeB_data.pedagogy,
          responsive: challengeB_data.responsive,
          shuffled: challengeB_data.shuffled,
          skillId: challengeB_data.skillId,
          spoil: challengeB_data.spoil,
          status: challengeB_data.status,
          t1Status: challengeB_data.t1Status,
          t2Status: challengeB_data.t2Status,
          t3Status: challengeB_data.t3Status,
          timer: challengeB_data.timer,
          type: challengeB_data.type,
          updatedAt: expect.any(Date),
          validatedAt: challengeB_data.validatedAt,
          version: challengeB_data.version,
        },
      ]);

      await expect(
        knex('translations').select('key', 'locale', 'value').orderBy(['key', 'locale']),
      ).resolves.toStrictEqual([
        {
          key: 'challenge.challengeA_id.instruction',
          locale: 'fr',
          value: 'instruction FR challengeA',
        },
        {
          key: 'challenge.challengeA_id.instruction',
          locale: 'nl',
          value: 'instruction NL challengeA',
        },
        {
          key: 'challenge.challengeA_id.solution',
          locale: 'fr',
          value: 'solution FR challengeA',
        },
        {
          key: 'challenge.challengeB_id.instruction',
          locale: 'fr',
          value: 'instruction FR challengeB',
        },
        {
          key: 'challenge.challengeB_id.proposals',
          locale: 'fr',
          value: 'proposals FR challengeB',
        },
      ]);
    });
  });

  describe('#create', () => {
    it('should create a challenge, its localized challenge primary and its translated attributes', async function() {
      // given
      const challengeToCreate_data = {
        id: 'challengeToCreate_id',
        accessibility1: Challenge.ACCESSIBILITY1.OK,
        accessibility2: Challenge.ACCESSIBILITY1.KO,
        alternativeVersion: 1,
        assessmentMaintenanceTags: [Challenge.ASSESSMENT_MAINTENANCE_TAGS.EMBED_NAME],
        archivedAt: null,
        createdAt: null,
        validatedAt: null,
        madeObsoleteAt: null,
        updatedAt: null,
        author: ['MOI'],
        autoReply: true,
        competenceId: 'Unused competenceId',
        declinable: Challenge.DECLINABLES.FACILEMENT,
        embedHeight: 666,
        files: [],
        focusable: true,
        format: Challenge.FORMATS.MOTS,
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        geography: 'FR',
        locales: ['fr'],
        localesAirtable: ['Francophone'],
        pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
        responsive: Challenge.RESPONSIVES.SMARTPHONE,
        shuffled: false,
        skillId: 'skillId1',
        spoil: Challenge.SPOILS.NON_SPOILABLE,
        status: Challenge.STATUSES.PROPOSE,
        t1Status: false,
        t1StatusAirtable: 'Désactivé',
        t2Status: false,
        t2StatusAirtable: 'Désactivé',
        t3Status: true,
        t3StatusAirtable: 'Activé',
        timer: 123,
        type: 'type challengeToCreate',
        version: 4,
      };
      const localizedChallengeToCreate = domainBuilder.buildLocalizedChallenge({
        id: 'challengeToCreate_id',
        challengeId: 'challengeToCreate_id',
        embedUrl: 'https://challengeToCreate_id.embedUrl.html',
        fileIds: ['ignored'],
        locale: 'fr',
        status: null,
        geography: 'FR',
        urlsToConsult: ['http://challengeToCreate_id.urlToConsult.com'],
        requireGafamWebsiteAccess: true,
        isIncompatibleIpadCertif: true,
        deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
        isAwarenessChallenge: true,
        toRephrase: true,
        hasEmbedInternalValidation: true,
        noValidationNeeded: true,
      });
      const challengeToCreate = domainBuilder.buildChallenge({
        ...challengeToCreate_data,
        localizedChallenges: [localizedChallengeToCreate],
        translations: {
          fr: {
            instruction: 'instruction FR challengeToCreate',
            solution: 'solution FR challengeToCreate',
            alternativeInstruction: 'alternativeInstruction FR challengeToCreate',
            proposals: 'proposals FR challengeToCreate',
            solutionToDisplay: 'solutionToDisplay FR challengeToCreate',
            embedTitle: 'embedTitle FR challengeToCreate',
            illustrationAlt: 'illustrationAlt FR challengeToCreate',
          },
        },
      });

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: challengeToCreate_data.skillId, tubeId: 'tube1' });
      await databaseBuilder.commit();

      // when
      const challenge = await challengeRepository.create(challengeToCreate);

      // then
      expect(challenge.id).toStrictEqual(expect.stringMatching(/^challenge/));
      expect(challenge).toStrictEqual(
        domainBuilder.buildChallenge({
          accessibility1: challengeToCreate_data.accessibility1,
          accessibility2: challengeToCreate_data.accessibility2,
          alternativeVersion: challengeToCreate_data.alternativeVersion,
          archivedAt: challengeToCreate_data.archivedAt,
          assessmentMaintenanceTags: challengeToCreate_data.assessmentMaintenanceTags,
          author: challengeToCreate_data.author,
          autoReply: challengeToCreate_data.autoReply,
          competenceId: 'competence1',
          createdAt: expect.any(Date),
          declinable: challengeToCreate_data.declinable,
          embedHeight: challengeToCreate_data.embedHeight,
          files: challengeToCreate_data.files,
          focusable: challengeToCreate_data.focusable,
          format: challengeToCreate_data.format,
          genealogy: challengeToCreate_data.genealogy,
          geography: challengeToCreate_data.geography,
          locales: challengeToCreate_data.locales,
          id: challenge.id,
          localizedChallenges: [{ ...challengeToCreate.localizedChallenges[0], challengeId: challenge.id, id: challenge.id }],
          madeObsoleteAt: challengeToCreate_data.madeObsoleteAt,
          pedagogy: challengeToCreate_data.pedagogy,
          responsive: challengeToCreate_data.responsive,
          shuffled: challengeToCreate_data.shuffled,
          skillId: challengeToCreate_data.skillId,
          spoil: challengeToCreate_data.spoil,
          status: challengeToCreate_data.status,
          t1Status: challengeToCreate_data.t1Status,
          t2Status: challengeToCreate_data.t2Status,
          t3Status: challengeToCreate_data.t3Status,
          timer: challengeToCreate_data.timer,
          translations: challengeToCreate.translations,
          type: challengeToCreate_data.type,
          updatedAt: expect.any(Date),
          validatedAt: challengeToCreate_data.validatedAt,
          version: challengeToCreate_data.version,
        }),
      );

      await expect(knex.select('*').from('challenges')).resolves.toStrictEqual([
        {
          accessibility1: challengeToCreate_data.accessibility1,
          accessibility2: challengeToCreate_data.accessibility2,
          alternativeVersion: challengeToCreate_data.alternativeVersion,
          archivedAt: challengeToCreate_data.archivedAt,
          assessmentMaintenanceTags: challengeToCreate_data.assessmentMaintenanceTags,
          author: challengeToCreate_data.author,
          autoReply: challengeToCreate_data.autoReply,
          createdAt: expect.any(Date),
          declinable: challengeToCreate_data.declinable,
          embedHeight: challengeToCreate_data.embedHeight,
          focusable: challengeToCreate_data.focusable,
          format: challengeToCreate_data.format,
          genealogy: challengeToCreate_data.genealogy,
          id: challenge.id,
          isQualityOk: challenge.isQualityOk,
          locales: challengeToCreate_data.locales,
          madeObsoleteAt: challengeToCreate_data.madeObsoleteAt,
          pedagogy: challengeToCreate_data.pedagogy,
          responsive: challengeToCreate_data.responsive,
          shuffled: challengeToCreate_data.shuffled,
          skillId: challengeToCreate_data.skillId,
          spoil: challengeToCreate_data.spoil,
          status: challengeToCreate_data.status,
          t1Status: challengeToCreate_data.t1Status,
          t2Status: challengeToCreate_data.t2Status,
          t3Status: challengeToCreate_data.t3Status,
          timer: challengeToCreate_data.timer,
          type: challengeToCreate_data.type,
          updatedAt: expect.any(Date),
          validatedAt: challengeToCreate_data.validatedAt,
          version: challengeToCreate_data.version,
        },
      ]);

      const localizedChallenges = await knex('localized_challenges').select('*').orderBy(['challengeId', 'id']);
      expect(localizedChallenges).toStrictEqual([
        {
          id: challenge.id,
          challengeId: challenge.id,
          embedUrl: localizedChallengeToCreate.embedUrl,
          locale: localizedChallengeToCreate.locale,
          status: localizedChallengeToCreate.status,
          geography: localizedChallengeToCreate.geography,
          urlsToConsult: localizedChallengeToCreate.urlsToConsult,
          requireGafamWebsiteAccess: true,
          isIncompatibleIpadCertif: true,
          deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
          isAwarenessChallenge: true,
          toRephrase: true,
          hasEmbedInternalValidation: true,
          noValidationNeeded: true,
          validatedAt: null,
        },
      ]);

      const allTranslations = await knex('translations').select('key', 'locale', 'value').orderBy(['key', 'locale']);
      expect(allTranslations).to.deep.have.members([
        {
          key: `challenge.${challenge.id}.instruction`,
          locale: 'fr',
          value: 'instruction FR challengeToCreate',
        },
        {
          key: `challenge.${challenge.id}.solution`,
          locale: 'fr',
          value: 'solution FR challengeToCreate',
        },
        {
          key: `challenge.${challenge.id}.alternativeInstruction`,
          locale: 'fr',
          value: 'alternativeInstruction FR challengeToCreate',
        },
        {
          key: `challenge.${challenge.id}.proposals`,
          locale: 'fr',
          value: 'proposals FR challengeToCreate',
        },
        {
          key: `challenge.${challenge.id}.solutionToDisplay`,
          locale: 'fr',
          value: 'solutionToDisplay FR challengeToCreate',
        },
        {
          key: `challenge.${challenge.id}.embedTitle`,
          locale: 'fr',
          value: 'embedTitle FR challengeToCreate',
        },
        {
          key: `challenge.${challenge.id}.illustrationAlt`,
          locale: 'fr',
          value: 'illustrationAlt FR challengeToCreate',
        },
      ]);
    });
  });

  describe('#update', () => {
    it('should update the challenge’s skill', async () => {
      // given
      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: 'skill1', tubeId: 'tube1' });
      databaseBuilder.factory.buildSkill({ id: 'skill2', tubeId: 'tube1' });

      const challengeData = domainBuilder.buildChallengeDatasourceObject({ skillId: 'skill1' });

      databaseBuilder.factory.buildChallenge(challengeData);
      databaseBuilder.factory.buildLocalizedChallenge({
        id: challengeData.id,
        challengeId: challengeData.id,
        locale: challengeData.locales[0],
      });
      await databaseBuilder.commit();

      const challenge = domainBuilder.buildChallenge({ ...challengeData, skillId: 'skill2' });

      // when
      const updatedChallenge = await challengeRepository.update(challenge);

      // then
      expect(updatedChallenge).toHaveProperty('skillId', 'skill2');
      expect(updatedChallenge).toHaveProperty('skills', ['skill2']);

      await expect(
        knex.select('skillId').from('challenges').where('id', challengeData.id).first(),
      ).resolves.toStrictEqual({ skillId: 'skill2' });
    });
  });

  describe('#listValidPrototypesBySkillIds', () => {
    it('returns domain challenges', async () => {
      // given
      const challengeId = 'challengeId';
      const expectedChallenges = [
        domainBuilder.buildChallenge({
          id: challengeId,
          files: [],
          skillId: 'skillId1',
          competenceId: 'competence1',
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({
              id: challengeId,
              challengeId,
              locale: 'fr',
            }),
          ],
        }),
      ];

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: expectedChallenges[0].skillId, tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(expectedChallenges[0]);

      for (const challenge of expectedChallenges) {
        databaseBuilder.factory.buildTranslation({
          key: `challenge.${challenge.id}.instruction`,
          locale: 'fr',
          value: challenge.translations.fr.instruction,
        });
        databaseBuilder.factory.buildTranslation({
          key: `challenge.${challenge.id}.alternativeInstruction`,
          locale: 'fr',
          value: challenge.translations.fr.alternativeInstruction,
        });
        databaseBuilder.factory.buildTranslation({
          key: `challenge.${challenge.id}.proposals`,
          locale: 'fr',
          value: challenge.translations.fr.proposals,
        });
        databaseBuilder.factory.buildTranslation({
          key: `challenge.${challenge.id}.solution`,
          locale: 'fr',
          value: challenge.translations.fr.solution,
        });
        databaseBuilder.factory.buildTranslation({
          key: `challenge.${challenge.id}.solutionToDisplay`,
          locale: 'fr',
          value: challenge.translations.fr.solutionToDisplay,
        });
        databaseBuilder.factory.buildTranslation({
          key: `challenge.${challenge.id}.embedTitle`,
          locale: 'fr',
          value: challenge.translations.fr.embedTitle,
        });

        databaseBuilder.factory.buildLocalizedChallenge(challenge.localizedChallenges[0]);
      }
      await databaseBuilder.commit();

      // when
      const result = await challengeRepository.listValidPrototypesBySkillIds(['skillId1', 'skillId2']);

      // then
      expect(result).toStrictEqual(expectedChallenges);
    });
  });

  describe('#listByThematicIds', () => {
    it('returns domain challenges', async () => {
      // given
      const challengeId = 'challengeId';
      const expectedChallenges = [
        domainBuilder.buildChallenge({
          id: challengeId,
          files: [],
          skillId: 'skillId1',
          competenceId: 'competence1',
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({
              id: challengeId,
              challengeId,
              locale: 'fr',
            }),
          ],
        }),
      ];

      databaseBuilder.factory.buildFramework({ id: 'recFmk1', name: 'Fmk 1' });
      databaseBuilder.factory.buildArea({ id: 'area1', code: '1', frameworkId: 'recFmk1' });
      databaseBuilder.factory.buildCompetence({ id: 'competence1', index: '1.1', areaId: 'area1' });
      databaseBuilder.factory.buildThematic({ id: 'thematic1', competenceId: 'competence1' });
      databaseBuilder.factory.buildTube({ id: 'tube1', name: '@tube', thematicId: 'thematic1' });
      databaseBuilder.factory.buildSkill({ id: expectedChallenges[0].skillId, tubeId: 'tube1' });
      databaseBuilder.factory.buildChallenge(expectedChallenges[0]);

      for (const challenge of expectedChallenges) {
        databaseBuilder.factory.buildTranslation({
          key: `challenge.${challenge.id}.instruction`,
          locale: 'fr',
          value: challenge.translations.fr.instruction,
        });
        databaseBuilder.factory.buildTranslation({
          key: `challenge.${challenge.id}.alternativeInstruction`,
          locale: 'fr',
          value: challenge.translations.fr.alternativeInstruction,
        });
        databaseBuilder.factory.buildTranslation({
          key: `challenge.${challenge.id}.proposals`,
          locale: 'fr',
          value: challenge.translations.fr.proposals,
        });
        databaseBuilder.factory.buildTranslation({
          key: `challenge.${challenge.id}.solution`,
          locale: 'fr',
          value: challenge.translations.fr.solution,
        });
        databaseBuilder.factory.buildTranslation({
          key: `challenge.${challenge.id}.solutionToDisplay`,
          locale: 'fr',
          value: challenge.translations.fr.solutionToDisplay,
        });
        databaseBuilder.factory.buildTranslation({
          key: `challenge.${challenge.id}.embedTitle`,
          locale: 'fr',
          value: challenge.translations.fr.embedTitle,
        });

        databaseBuilder.factory.buildLocalizedChallenge(challenge.localizedChallenges[0]);
      }
      await databaseBuilder.commit();

      // when
      const result = await challengeRepository.listByThematicIds(['thematic1', 'thematic2']);

      // then
      expect(result).toStrictEqual(expectedChallenges);
    });
  });
});

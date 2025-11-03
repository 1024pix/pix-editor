import { afterEach, describe, expect, it, vi } from 'vitest';
import { airtableBuilder, databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import * as airtableClient from '../../../../lib/infrastructure/airtable.js';
import * as airtable from '../../../../lib/infrastructure/airtable.js';
import { Challenge, LocalizedChallenge, Skill } from '../../../../lib/domain/models/index.js';
import * as challengeRepository from '../../../../lib/infrastructure/repositories/challenge-repository.js';
import { challengeDatasource, skillDatasource } from '../../../../lib/infrastructure/datasources/airtable/index.js';
import _ from 'lodash';
import Airtable from 'airtable';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Integration | Repository | challenge-repository', () => {
  describe('get', () => {
    it('should return the challenge when exist', async () => {
      // given
      const challengeA_data = {
        id: 'challengeA_id',
        localizedEsId: 'locES_challengeA_id',
        airtableId: 'airtableChallengeA_id',
        skillId: 'skillId',
        competenceId: 'competence1',
        alpha: 1,
        alphaAirtable: '1',
        delta: 2,
        deltaAirtable: '2',
        type: 'type challengeA',
        t1StatusAirtable: 'Activé',
        t1Status: true,
        t2StatusAirtable: 'Désactivé',
        t2Status: false,
        t3StatusAirtable: 'Activé',
        t3Status: true,
        status: Challenge.STATUSES.PROPOSE,
        embedHeight: 678,
        timer: 789,
        format: Challenge.FORMATS.MOTS,
        autoReply: false,
        localesAirtable: ['Francophone'],
        locales: ['fr'],
        focusable: false,
        skills: ['airtableSkillId'],
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
        contextualizedFields: [Challenge.CONTEXTUALIZED_FIELDS.EMBED],
        files: [
          { fileId: 'attachmentA', localizedChallengeId: 'challengeA_id' },
          { fileId: 'attachmentB', localizedChallengeId: 'locES_challengeA_id' },
        ],
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
      vi.spyOn(airtableClient, 'findRecords').mockImplementation((tableName) => {
        if (tableName !== 'Epreuves') expect.unreachable('Airtable tableName should be Epreuves');
        return [
          {
            id: challengeA_data.airtableId,
            fields: {
              'id persistant': challengeA_data.id,
              'Record ID': challengeA_data.airtableId,
              'Compétences (via tube) (id persistant)': [challengeA_data.competenceId],
              "Type d'épreuve": challengeA_data.type,
              'T1 - Espaces, casse & accents': challengeA_data.t1StatusAirtable,
              'T2 - Ponctuation': challengeA_data.t2StatusAirtable,
              "T3 - Distance d'édition": challengeA_data.t3StatusAirtable,
              Statut: challengeA_data.status,
              'Embed URL': challengeA_data.embedUrl,
              'Embed height': challengeA_data.embedHeight,
              Timer: challengeA_data.timer,
              Format: challengeA_data.format,
              'Réponse automatique': challengeA_data.autoReply,
              Langues: challengeA_data.localesAirtable,
              Focalisée: challengeA_data.focusable,
              'Difficulté calculée': challengeA_data.deltaAirtable,
              'Discrimination calculée': challengeA_data.alphaAirtable,
              Acquix: challengeA_data.skills,
              'Acquix (id persistant)': [challengeA_data.skillId],
              Généalogie: challengeA_data.genealogy,
              'Type péda': challengeA_data.pedagogy,
              Auteur: challengeA_data.author,
              Déclinable: challengeA_data.declinable,
              'Version prototype': challengeA_data.version,
              'Version déclinaison': challengeA_data.alternativeVersion,
              'Non voyant': challengeA_data.accessibility1,
              Daltonien: challengeA_data.accessibility2,
              Spoil: challengeA_data.spoil,
              Responsive: challengeA_data.responsive,
              Géographie: challengeA_data.geography,
              files: challengeA_data.files.map(({ fileId }) => fileId),
              filesLocalizedChallengeIds: challengeA_data.files.map(({ localizedChallengeId }) => localizedChallengeId),
              validated_at: challengeA_data.validatedAt,
              archived_at: challengeA_data.archivedAt,
              created_at: challengeA_data.createdAt,
              made_obsolete_at: challengeA_data.madeObsoleteAt,
              updated_at: challengeA_data.updatedAt,
              shuffled: challengeA_data.shuffled,
              contextualizedFields: challengeA_data.contextualizedFields,
            },
            get: function (field) {
              return this.fields[field];
            },
          },
        ];
      });

      // when
      const challenge = await challengeRepository.get(challengeA_data.id);

      // then
      expect(challenge).toStrictEqual(
        domainBuilder.buildChallenge({
          accessibility1: challengeA_data.accessibility1,
          accessibility2: challengeA_data.accessibility2,
          airtableId: challengeA_data.airtableId,
          alternativeVersion: challengeA_data.alternativeVersion,
          alpha: challengeA_data.alpha,
          archivedAt: challengeA_data.archivedAt,
          author: challengeA_data.author,
          autoReply: challengeA_data.autoReply,
          competenceId: challengeA_data.competenceId,
          contextualizedFields: challengeA_data.contextualizedFields,
          createdAt: challengeA_data.createdAt,
          declinable: challengeA_data.declinable,
          delta: challengeA_data.delta,
          embedHeight: challengeA_data.embedHeight,
          files: challengeA_data.files,
          focusable: challengeA_data.focusable,
          format: challengeA_data.format,
          genealogy: challengeA_data.genealogy,
          geography: challengeA_data.geography,
          id: challengeA_data.id,
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
          skills: challengeA_data.skills,
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
      // given
      vi.spyOn(airtableClient, 'findRecords').mockImplementation((tableName) => {
        if (tableName !== 'Epreuves') expect.unreachable('Airtable tableName should be Epreuves');
        return [];
      });

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
          airtableId: 'airtableChallengeA_id',
          skillId: 'skillId',
          competenceId: 'competenceId',
          alpha: 1,
          alphaAirtable: '1',
          delta: 2,
          deltaAirtable: '2',
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
          skills: ['airtableSkillId'],
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
          files: [],
          validatedAt: null,
          archivedAt: null,
          createdAt: '2025-10-23T10:17:00Z',
          updatedAt: '2025-10-23T10:18:00Z',
          madeObsoleteAt: null,
          shuffled: false,
          contextualizedFields: [Challenge.CONTEXTUALIZED_FIELDS.EMBED],
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
          airtableId: 'airtableChallengeB_id',
          skillId: 'skillId',
          competenceId: 'competenceId',
          alpha: 3,
          alphaAirtable: '3',
          delta: 4,
          deltaAirtable: '4',
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
          skills: ['airtableSkillId'],
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
          contextualizedFields: [Challenge.CONTEXTUALIZED_FIELDS.ILLUSTRATION],
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
        vi.spyOn(airtableClient, 'findRecords').mockImplementation((tableName, options) => {
          if (tableName !== 'Epreuves') expect.unreachable('Airtable tableName should be Epreuves');
          if (
            options?.filterByFormula !==
            'OR(FIND("toto", LOWER(CONCATENATE({Embed URL}))), "challengeA_id" = {id persistant},"challengeB_id" = {id persistant})'
          )
            expect.unreachable('Wrong filterByFormula');
          return [
            {
              id: challengeA_data.airtableId,
              fields: {
                'id persistant': challengeA_data.id,
                'Record ID': challengeA_data.airtableId,
                'Compétences (via tube) (id persistant)': [challengeA_data.competenceId],
                "Type d'épreuve": challengeA_data.type,
                'T1 - Espaces, casse & accents': challengeA_data.t1StatusAirtable,
                'T2 - Ponctuation': challengeA_data.t2StatusAirtable,
                "T3 - Distance d'édition": challengeA_data.t3StatusAirtable,
                Statut: challengeA_data.status,
                'Embed URL': challengeA_data.embedUrl,
                'Embed height': challengeA_data.embedHeight,
                Timer: challengeA_data.timer,
                Format: challengeA_data.format,
                'Réponse automatique': challengeA_data.autoReply,
                Langues: challengeA_data.localesAirtable,
                Focalisée: challengeA_data.focusable,
                'Difficulté calculée': challengeA_data.deltaAirtable,
                'Discrimination calculée': challengeA_data.alphaAirtable,
                Acquix: challengeA_data.skills,
                'Acquix (id persistant)': [challengeA_data.skillId],
                Généalogie: challengeA_data.genealogy,
                'Type péda': challengeA_data.pedagogy,
                Auteur: challengeA_data.author,
                Déclinable: challengeA_data.declinable,
                'Version prototype': challengeA_data.version,
                'Version déclinaison': challengeA_data.alternativeVersion,
                'Non voyant': challengeA_data.accessibility1,
                Daltonien: challengeA_data.accessibility2,
                Spoil: challengeA_data.spoil,
                Responsive: challengeA_data.responsive,
                Géographie: challengeA_data.geography,
                files: challengeA_data.files,
                validated_at: challengeA_data.validatedAt,
                archived_at: challengeA_data.archivedAt,
                created_at: challengeA_data.createdAt,
                made_obsolete_at: challengeA_data.madeObsoleteAt,
                updated_at: challengeA_data.updatedAt,
                shuffled: challengeA_data.shuffled,
                contextualizedFields: challengeA_data.contextualizedFields,
              },
              get: function (field) {
                return this.fields[field];
              },
            },
            {
              id: challengeB_data.airtableId,
              fields: {
                'id persistant': challengeB_data.id,
                'Record ID': challengeB_data.airtableId,
                'Compétences (via tube) (id persistant)': [challengeB_data.competenceId],
                "Type d'épreuve": challengeB_data.type,
                'T1 - Espaces, casse & accents': challengeB_data.t1StatusAirtable,
                'T2 - Ponctuation': challengeB_data.t2StatusAirtable,
                "T3 - Distance d'édition": challengeB_data.t3StatusAirtable,
                Statut: challengeB_data.status,
                'Embed URL': challengeB_data.embedUrl,
                'Embed height': challengeB_data.embedHeight,
                Timer: challengeB_data.timer,
                Format: challengeB_data.format,
                'Réponse automatique': challengeB_data.autoReply,
                Langues: challengeB_data.localesAirtable,
                Focalisée: challengeB_data.focusable,
                'Difficulté calculée': challengeB_data.deltaAirtable,
                'Discrimination calculée': challengeB_data.alphaAirtable,
                Acquix: challengeB_data.skills,
                'Acquix (id persistant)': [challengeB_data.skillId],
                Généalogie: challengeB_data.genealogy,
                'Type péda': challengeB_data.pedagogy,
                Auteur: challengeB_data.author,
                Déclinable: challengeB_data.declinable,
                'Version prototype': challengeB_data.version,
                'Version déclinaison': challengeB_data.alternativeVersion,
                'Non voyant': challengeB_data.accessibility1,
                Daltonien: challengeB_data.accessibility2,
                Spoil: challengeB_data.spoil,
                Responsive: challengeB_data.responsive,
                Géographie: challengeB_data.geography,
                files: challengeB_data.files,
                validated_at: challengeB_data.validatedAt,
                archived_at: challengeB_data.archivedAt,
                made_obsolete_at: challengeB_data.madeObsoleteAt,
                created_at: challengeB_data.createdAt,
                updated_at: challengeB_data.updatedAt,
                shuffled: challengeB_data.shuffled,
                contextualizedFields: challengeB_data.contextualizedFields,
              },
              get: function (field) {
                return this.fields[field];
              },
            },
          ];
        });

        // when
        const challenges = await challengeRepository.filter({ filter: { search: 'toto' }, page: { size: 5 } });

        // then
        expect(challenges).toStrictEqual([
          domainBuilder.buildChallenge({
            accessibility1: challengeA_data.accessibility1,
            accessibility2: challengeA_data.accessibility2,
            airtableId: challengeA_data.airtableId,
            alternativeVersion: challengeA_data.alternativeVersion,
            alpha: challengeA_data.alpha,
            archivedAt: challengeA_data.archivedAt,
            author: challengeA_data.author,
            autoReply: challengeA_data.autoReply,
            competenceId: challengeA_data.competenceId,
            contextualizedFields: challengeA_data.contextualizedFields,
            createdAt: challengeA_data.createdAt,
            declinable: challengeA_data.declinable,
            delta: challengeA_data.delta,
            embedHeight: challengeA_data.embedHeight,
            files: challengeA_data.files,
            focusable: challengeA_data.focusable,
            format: challengeA_data.format,
            genealogy: challengeA_data.genealogy,
            geography: challengeA_data.geography,
            id: challengeA_data.id,
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
            skills: challengeA_data.skills,
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
            airtableId: challengeB_data.airtableId,
            alternativeVersion: challengeB_data.alternativeVersion,
            alpha: challengeB_data.alpha,
            archivedAt: challengeB_data.archivedAt,
            author: challengeB_data.author,
            autoReply: challengeB_data.autoReply,
            competenceId: challengeB_data.competenceId,
            contextualizedFields: challengeB_data.contextualizedFields,
            createdAt: challengeB_data.createdAt,
            declinable: challengeB_data.declinable,
            delta: challengeB_data.delta,
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
            skills: challengeB_data.skills,
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
      it('should find challenges from airtable where embed url contains search', async () => {
        // given
        const challengeA_data = {
          id: 'challengeA_id',
          localizedEsId: 'locES_challengeA_id',
          airtableId: 'airtableChallengeA_id',
          skillId: 'skillId',
          competenceId: 'competenceId',
          alpha: 1,
          alphaAirtable: '1',
          delta: 2,
          deltaAirtable: '2',
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
          skills: ['airtableSkillId'],
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
          files: [],
          validatedAt: null,
          archivedAt: null,
          createdAt: '2025-10-23T10:17:00Z',
          updatedAt: '2025-10-23T10:18:00Z',
          madeObsoleteAt: null,
          shuffled: false,
          contextualizedFields: [Challenge.CONTEXTUALIZED_FIELDS.EMBED],
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
        await databaseBuilder.commit();
        vi.spyOn(airtableClient, 'findRecords').mockImplementation((tableName, options) => {
          if (tableName !== 'Epreuves') expect.unreachable('Airtable tableName should be Epreuves');
          if (options?.filterByFormula !== 'FIND("toto", LOWER(CONCATENATE({Embed URL})))')
            expect.unreachable('Wrong filterByFormula');
          return [
            {
              id: challengeA_data.airtableId,
              fields: {
                'id persistant': challengeA_data.id,
                'Record ID': challengeA_data.airtableId,
                'Compétences (via tube) (id persistant)': [challengeA_data.competenceId],
                "Type d'épreuve": challengeA_data.type,
                'T1 - Espaces, casse & accents': challengeA_data.t1StatusAirtable,
                'T2 - Ponctuation': challengeA_data.t2StatusAirtable,
                "T3 - Distance d'édition": challengeA_data.t3StatusAirtable,
                Statut: challengeA_data.status,
                'Embed URL': challengeA_data.embedUrl,
                'Embed height': challengeA_data.embedHeight,
                Timer: challengeA_data.timer,
                Format: challengeA_data.format,
                'Réponse automatique': challengeA_data.autoReply,
                Langues: challengeA_data.localesAirtable,
                Focalisée: challengeA_data.focusable,
                'Difficulté calculée': challengeA_data.deltaAirtable,
                'Discrimination calculée': challengeA_data.alphaAirtable,
                Acquix: challengeA_data.skills,
                'Acquix (id persistant)': [challengeA_data.skillId],
                Généalogie: challengeA_data.genealogy,
                'Type péda': challengeA_data.pedagogy,
                Auteur: challengeA_data.author,
                Déclinable: challengeA_data.declinable,
                'Version prototype': challengeA_data.version,
                'Version déclinaison': challengeA_data.alternativeVersion,
                'Non voyant': challengeA_data.accessibility1,
                Daltonien: challengeA_data.accessibility2,
                Spoil: challengeA_data.spoil,
                Responsive: challengeA_data.responsive,
                Géographie: challengeA_data.geography,
                files: challengeA_data.files,
                validated_at: challengeA_data.validatedAt,
                archived_at: challengeA_data.archivedAt,
                created_at: challengeA_data.createdAt,
                made_obsolete_at: challengeA_data.madeObsoleteAt,
                updated_at: challengeA_data.updatedAt,
                shuffled: challengeA_data.shuffled,
                contextualizedFields: challengeA_data.contextualizedFields,
              },
              get: function (field) {
                return this.fields[field];
              },
            },
          ];
        });

        // when
        const challenges = await challengeRepository.filter({ filter: { search: 'toto' }, page: { size: 5 } });

        // then
        expect(challenges).toStrictEqual([
          domainBuilder.buildChallenge({
            accessibility1: challengeA_data.accessibility1,
            accessibility2: challengeA_data.accessibility2,
            airtableId: challengeA_data.airtableId,
            alternativeVersion: challengeA_data.alternativeVersion,
            alpha: challengeA_data.alpha,
            archivedAt: challengeA_data.archivedAt,
            author: challengeA_data.author,
            autoReply: challengeA_data.autoReply,
            competenceId: challengeA_data.competenceId,
            contextualizedFields: challengeA_data.contextualizedFields,
            createdAt: challengeA_data.createdAt,
            declinable: challengeA_data.declinable,
            delta: challengeA_data.delta,
            embedHeight: challengeA_data.embedHeight,
            files: challengeA_data.files,
            focusable: challengeA_data.focusable,
            format: challengeA_data.format,
            genealogy: challengeA_data.genealogy,
            geography: challengeA_data.geography,
            id: challengeA_data.id,
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
            skills: challengeA_data.skills,
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
        airtableId: 'airtableChallengeA_id',
        skillId: 'skillId',
        competenceId: 'competenceId',
        alpha: 1,
        alphaAirtable: '1',
        delta: 2,
        deltaAirtable: '2',
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
        skills: ['airtableSkillId'],
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
        files: [],
        validatedAt: null,
        archivedAt: null,
        createdAt: '2025-10-23T10:17:00Z',
        updatedAt: '2025-10-23T10:18:00Z',
        madeObsoleteAt: null,
        shuffled: false,
        contextualizedFields: [Challenge.CONTEXTUALIZED_FIELDS.EMBED],
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
        airtableId: 'airtableChallengeB_id',
        skillId: 'skillId',
        competenceId: 'competenceId',
        alpha: 3,
        alphaAirtable: '3',
        delta: 4,
        deltaAirtable: '4',
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
        skills: ['airtableSkillId'],
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
        contextualizedFields: [Challenge.CONTEXTUALIZED_FIELDS.ILLUSTRATION],
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
      vi.spyOn(airtableClient, 'findRecords').mockImplementation((tableName, options) => {
        if (tableName !== 'Epreuves') expect.unreachable('Airtable tableName should be Epreuves');
        if (options?.filterByFormula !== '{Acquix (id persistant)} = "skillId"')
          expect.unreachable('Wrong filterByFormula');
        return [
          {
            id: challengeA_data.airtableId,
            fields: {
              'id persistant': challengeA_data.id,
              'Record ID': challengeA_data.airtableId,
              'Compétences (via tube) (id persistant)': [challengeA_data.competenceId],
              "Type d'épreuve": challengeA_data.type,
              'T1 - Espaces, casse & accents': challengeA_data.t1StatusAirtable,
              'T2 - Ponctuation': challengeA_data.t2StatusAirtable,
              "T3 - Distance d'édition": challengeA_data.t3StatusAirtable,
              Statut: challengeA_data.status,
              'Embed URL': challengeA_data.embedUrl,
              'Embed height': challengeA_data.embedHeight,
              Timer: challengeA_data.timer,
              Format: challengeA_data.format,
              'Réponse automatique': challengeA_data.autoReply,
              Langues: challengeA_data.localesAirtable,
              Focalisée: challengeA_data.focusable,
              'Difficulté calculée': challengeA_data.deltaAirtable,
              'Discrimination calculée': challengeA_data.alphaAirtable,
              Acquix: challengeA_data.skills,
              'Acquix (id persistant)': [challengeA_data.skillId],
              Généalogie: challengeA_data.genealogy,
              'Type péda': challengeA_data.pedagogy,
              Auteur: challengeA_data.author,
              Déclinable: challengeA_data.declinable,
              'Version prototype': challengeA_data.version,
              'Version déclinaison': challengeA_data.alternativeVersion,
              'Non voyant': challengeA_data.accessibility1,
              Daltonien: challengeA_data.accessibility2,
              Spoil: challengeA_data.spoil,
              Responsive: challengeA_data.responsive,
              Géographie: challengeA_data.geography,
              files: challengeA_data.files,
              validated_at: challengeA_data.validatedAt,
              archived_at: challengeA_data.archivedAt,
              created_at: challengeA_data.createdAt,
              made_obsolete_at: challengeA_data.madeObsoleteAt,
              updated_at: challengeA_data.updatedAt,
              shuffled: challengeA_data.shuffled,
              contextualizedFields: challengeA_data.contextualizedFields,
            },
            get: function (field) {
              return this.fields[field];
            },
          },
          {
            id: challengeB_data.airtableId,
            fields: {
              'id persistant': challengeB_data.id,
              'Record ID': challengeB_data.airtableId,
              'Compétences (via tube) (id persistant)': [challengeB_data.competenceId],
              "Type d'épreuve": challengeB_data.type,
              'T1 - Espaces, casse & accents': challengeB_data.t1StatusAirtable,
              'T2 - Ponctuation': challengeB_data.t2StatusAirtable,
              "T3 - Distance d'édition": challengeB_data.t3StatusAirtable,
              Statut: challengeB_data.status,
              'Embed URL': challengeB_data.embedUrl,
              'Embed height': challengeB_data.embedHeight,
              Timer: challengeB_data.timer,
              Format: challengeB_data.format,
              'Réponse automatique': challengeB_data.autoReply,
              Langues: challengeB_data.localesAirtable,
              Focalisée: challengeB_data.focusable,
              'Difficulté calculée': challengeB_data.deltaAirtable,
              'Discrimination calculée': challengeB_data.alphaAirtable,
              Acquix: challengeB_data.skills,
              'Acquix (id persistant)': [challengeB_data.skillId],
              Généalogie: challengeB_data.genealogy,
              'Type péda': challengeB_data.pedagogy,
              Auteur: challengeB_data.author,
              Déclinable: challengeB_data.declinable,
              'Version prototype': challengeB_data.version,
              'Version déclinaison': challengeB_data.alternativeVersion,
              'Non voyant': challengeB_data.accessibility1,
              Daltonien: challengeB_data.accessibility2,
              Spoil: challengeB_data.spoil,
              Responsive: challengeB_data.responsive,
              Géographie: challengeB_data.geography,
              files: challengeB_data.files,
              validated_at: challengeB_data.validatedAt,
              archived_at: challengeB_data.archivedAt,
              made_obsolete_at: challengeB_data.madeObsoleteAt,
              created_at: challengeB_data.createdAt,
              updated_at: challengeB_data.updatedAt,
              shuffled: challengeB_data.shuffled,
              contextualizedFields: challengeB_data.contextualizedFields,
            },
            get: function (field) {
              return this.fields[field];
            },
          },
        ];
      });

      // when
      const challenges = await challengeRepository.listBySkillId('skillId');

      // then
      expect(challenges).toStrictEqual([
        domainBuilder.buildChallenge({
          accessibility1: challengeA_data.accessibility1,
          accessibility2: challengeA_data.accessibility2,
          airtableId: challengeA_data.airtableId,
          alternativeVersion: challengeA_data.alternativeVersion,
          alpha: challengeA_data.alpha,
          archivedAt: challengeA_data.archivedAt,
          author: challengeA_data.author,
          autoReply: challengeA_data.autoReply,
          competenceId: challengeA_data.competenceId,
          contextualizedFields: challengeA_data.contextualizedFields,
          createdAt: challengeA_data.createdAt,
          declinable: challengeA_data.declinable,
          delta: challengeA_data.delta,
          embedHeight: challengeA_data.embedHeight,
          files: challengeA_data.files,
          focusable: challengeA_data.focusable,
          format: challengeA_data.format,
          genealogy: challengeA_data.genealogy,
          geography: challengeA_data.geography,
          id: challengeA_data.id,
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
          skills: challengeA_data.skills,
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
          airtableId: challengeB_data.airtableId,
          alternativeVersion: challengeB_data.alternativeVersion,
          alpha: challengeB_data.alpha,
          archivedAt: challengeB_data.archivedAt,
          author: challengeB_data.author,
          autoReply: challengeB_data.autoReply,
          competenceId: challengeB_data.competenceId,
          contextualizedFields: challengeB_data.contextualizedFields,
          createdAt: challengeB_data.createdAt,
          declinable: challengeB_data.declinable,
          delta: challengeB_data.delta,
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
          skills: challengeB_data.skills,
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
      // given
      vi.spyOn(airtableClient, 'findRecords').mockImplementation((tableName, options) => {
        if (tableName !== 'Epreuves') expect.unreachable('Airtable tableName should be Epreuves');
        if (options?.filterByFormula !== '{Acquix (id persistant)} = "someSkillId"')
          expect.unreachable('Wrong filterByFormula');
        return [];
      });

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
        airtableId: 'airtableChallengeA_id',
        skillId: 'skillId',
        competenceId: 'competence1',
        alpha: 1,
        alphaAirtable: '1',
        delta: 2,
        deltaAirtable: '2',
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
        skills: ['airtableSkillId'],
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
        files: [
          { fileId: 'attachmentA', localizedChallengeId: 'challengeA_id' },
          { fileId: 'attachmentB', localizedChallengeId: 'locES_challengeA_id' },
        ],
        validatedAt: null,
        archivedAt: null,
        createdAt: '2025-10-23T10:17:00Z',
        updatedAt: '2025-10-23T10:18:00Z',
        madeObsoleteAt: null,
        shuffled: false,
        contextualizedFields: [Challenge.CONTEXTUALIZED_FIELDS.EMBED],
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
        airtableId: 'airtableChallengeB_id',
        skillId: 'skillId',
        competenceId: 'competence1',
        alpha: 3,
        alphaAirtable: '3',
        delta: 4,
        deltaAirtable: '4',
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
        skills: ['airtableSkillId'],
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
        contextualizedFields: [Challenge.CONTEXTUALIZED_FIELDS.ILLUSTRATION],
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
      vi.spyOn(airtableClient, 'findRecords').mockImplementation((tableName) => {
        if (tableName !== 'Epreuves') expect.unreachable('Airtable tableName should be Epreuves');
        return [
          {
            id: challengeA_data.airtableId,
            fields: {
              'id persistant': challengeA_data.id,
              'Record ID': challengeA_data.airtableId,
              'Compétences (via tube) (id persistant)': [challengeA_data.competenceId],
              "Type d'épreuve": challengeA_data.type,
              'T1 - Espaces, casse & accents': challengeA_data.t1StatusAirtable,
              'T2 - Ponctuation': challengeA_data.t2StatusAirtable,
              "T3 - Distance d'édition": challengeA_data.t3StatusAirtable,
              Statut: challengeA_data.status,
              'Embed URL': challengeA_data.embedUrl,
              'Embed height': challengeA_data.embedHeight,
              Timer: challengeA_data.timer,
              Format: challengeA_data.format,
              'Réponse automatique': challengeA_data.autoReply,
              Langues: challengeA_data.localesAirtable,
              Focalisée: challengeA_data.focusable,
              'Difficulté calculée': challengeA_data.deltaAirtable,
              'Discrimination calculée': challengeA_data.alphaAirtable,
              Acquix: challengeA_data.skills,
              'Acquix (id persistant)': [challengeA_data.skillId],
              Généalogie: challengeA_data.genealogy,
              'Type péda': challengeA_data.pedagogy,
              Auteur: challengeA_data.author,
              Déclinable: challengeA_data.declinable,
              'Version prototype': challengeA_data.version,
              'Version déclinaison': challengeA_data.alternativeVersion,
              'Non voyant': challengeA_data.accessibility1,
              Daltonien: challengeA_data.accessibility2,
              Spoil: challengeA_data.spoil,
              Responsive: challengeA_data.responsive,
              Géographie: challengeA_data.geography,
              files: challengeA_data.files.map(({ fileId }) => fileId),
              filesLocalizedChallengeIds: challengeA_data.files.map(({ localizedChallengeId }) => localizedChallengeId),
              validated_at: challengeA_data.validatedAt,
              archived_at: challengeA_data.archivedAt,
              created_at: challengeA_data.createdAt,
              made_obsolete_at: challengeA_data.madeObsoleteAt,
              updated_at: challengeA_data.updatedAt,
              shuffled: challengeA_data.shuffled,
              contextualizedFields: challengeA_data.contextualizedFields,
            },
            get: function (field) {
              return this.fields[field];
            },
          },
          {
            id: challengeB_data.airtableId,
            fields: {
              'id persistant': challengeB_data.id,
              'Record ID': challengeB_data.airtableId,
              'Compétences (via tube) (id persistant)': [challengeB_data.competenceId],
              "Type d'épreuve": challengeB_data.type,
              'T1 - Espaces, casse & accents': challengeB_data.t1StatusAirtable,
              'T2 - Ponctuation': challengeB_data.t2StatusAirtable,
              "T3 - Distance d'édition": challengeB_data.t3StatusAirtable,
              Statut: challengeB_data.status,
              'Embed URL': challengeB_data.embedUrl,
              'Embed height': challengeB_data.embedHeight,
              Timer: challengeB_data.timer,
              Format: challengeB_data.format,
              'Réponse automatique': challengeB_data.autoReply,
              Langues: challengeB_data.localesAirtable,
              Focalisée: challengeB_data.focusable,
              'Difficulté calculée': challengeB_data.deltaAirtable,
              'Discrimination calculée': challengeB_data.alphaAirtable,
              Acquix: challengeB_data.skills,
              'Acquix (id persistant)': [challengeB_data.skillId],
              Généalogie: challengeB_data.genealogy,
              'Type péda': challengeB_data.pedagogy,
              Auteur: challengeB_data.author,
              Déclinable: challengeB_data.declinable,
              'Version prototype': challengeB_data.version,
              'Version déclinaison': challengeB_data.alternativeVersion,
              'Non voyant': challengeB_data.accessibility1,
              Daltonien: challengeB_data.accessibility2,
              Spoil: challengeB_data.spoil,
              Responsive: challengeB_data.responsive,
              Géographie: challengeB_data.geography,
              files: challengeB_data.files.map(({ fileId }) => fileId),
              filesLocalizedChallengeIds: challengeB_data.files.map(({ localizedChallengeId }) => localizedChallengeId),
              validated_at: challengeB_data.validatedAt,
              archived_at: challengeB_data.archivedAt,
              made_obsolete_at: challengeB_data.madeObsoleteAt,
              created_at: challengeB_data.createdAt,
              updated_at: challengeB_data.updatedAt,
              shuffled: challengeB_data.shuffled,
              contextualizedFields: challengeB_data.contextualizedFields,
            },
            get: function (field) {
              return this.fields[field];
            },
          },
        ];
      });

      // when
      const challenges = await challengeRepository.list();

      // then
      expect(challenges).toStrictEqual([
        domainBuilder.buildChallenge({
          accessibility1: challengeA_data.accessibility1,
          accessibility2: challengeA_data.accessibility2,
          airtableId: challengeA_data.airtableId,
          alternativeVersion: challengeA_data.alternativeVersion,
          alpha: challengeA_data.alpha,
          archivedAt: challengeA_data.archivedAt,
          author: challengeA_data.author,
          autoReply: challengeA_data.autoReply,
          competenceId: challengeA_data.competenceId,
          contextualizedFields: challengeA_data.contextualizedFields,
          createdAt: challengeA_data.createdAt,
          declinable: challengeA_data.declinable,
          delta: challengeA_data.delta,
          embedHeight: challengeA_data.embedHeight,
          files: challengeA_data.files,
          focusable: challengeA_data.focusable,
          format: challengeA_data.format,
          genealogy: challengeA_data.genealogy,
          geography: challengeA_data.geography,
          id: challengeA_data.id,
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
          skills: challengeA_data.skills,
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
          airtableId: challengeB_data.airtableId,
          alternativeVersion: challengeB_data.alternativeVersion,
          alpha: challengeB_data.alpha,
          archivedAt: challengeB_data.archivedAt,
          author: challengeB_data.author,
          autoReply: challengeB_data.autoReply,
          competenceId: challengeB_data.competenceId,
          contextualizedFields: challengeB_data.contextualizedFields,
          createdAt: challengeB_data.createdAt,
          declinable: challengeB_data.declinable,
          delta: challengeB_data.delta,
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
          skills: challengeB_data.skills,
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
      // given
      vi.spyOn(airtableClient, 'findRecords').mockImplementation((tableName, options) => {
        if (tableName !== 'Epreuves') expect.unreachable('Airtable tableName should be Epreuves');
        if (options?.filterByFormula !== '{Acquix (id persistant)} = "someSkillId"')
          expect.unreachable('Wrong filterByFormula');
        return [];
      });

      // when
      const challenges = await challengeRepository.listBySkillId('someSkillId');

      // then
      expect(challenges).toStrictEqual([]);
    });
  });

  describe('#listActiveOrDraftByCompetenceId', () => {
    it('should retrieve active & draft challenges by given competence id', async () => {
      // given
      const challengeDraftA_data = {
        id: 'challengeDraftA_id',
        localizedEsId: 'locES_challengeDraftA_id',
        airtableId: 'airtableChallengeDraftA_id',
        skillId: 'skillId',
        competenceId: 'competenceId',
        alpha: 1,
        alphaAirtable: '1',
        delta: 2,
        deltaAirtable: '2',
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
        skills: ['airtableSkillId'],
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
        files: [],
        validatedAt: null,
        archivedAt: null,
        createdAt: '2025-10-23T10:17:00Z',
        updatedAt: '2025-10-23T10:18:00Z',
        madeObsoleteAt: null,
        shuffled: true,
        contextualizedFields: [Challenge.CONTEXTUALIZED_FIELDS.EMBED],
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
        airtableId: 'airtableChallengeActiveA_id',
        skillId: 'skillId',
        competenceId: 'competenceId',
        alpha: 1,
        alphaAirtable: '1',
        delta: 2,
        deltaAirtable: '2',
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
        skills: ['airtableSkillId'],
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
        contextualizedFields: [Challenge.CONTEXTUALIZED_FIELDS.EMBED],
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
      vi.spyOn(airtableClient, 'findRecords').mockImplementation((tableName, options) => {
        if (tableName !== 'Epreuves') expect.unreachable('Airtable tableName should be Epreuves');
        if (
          options?.filterByFormula !==
          `AND({Compétences (via tube) (id persistant)} = "${challengeDraftA_data.competenceId}", {acquis} != "${Skill.WORKBENCH_NAME}", OR({Statut} = "${Challenge.STATUSES.PROPOSE}", {Statut} = "${Challenge.STATUSES.VALIDE}"))`
        )
          expect.unreachable('Wrong filterByFormula');
        return [
          {
            id: challengeDraftA_data.airtableId,
            fields: {
              'id persistant': challengeDraftA_data.id,
              'Record ID': challengeDraftA_data.airtableId,
              'Compétences (via tube) (id persistant)': [challengeDraftA_data.competenceId],
              "Type d'épreuve": challengeDraftA_data.type,
              'T1 - Espaces, casse & accents': challengeDraftA_data.t1StatusAirtable,
              'T2 - Ponctuation': challengeDraftA_data.t2StatusAirtable,
              "T3 - Distance d'édition": challengeDraftA_data.t3StatusAirtable,
              Statut: challengeDraftA_data.status,
              'Embed URL': challengeDraftA_data.embedUrl,
              'Embed height': challengeDraftA_data.embedHeight,
              Timer: challengeDraftA_data.timer,
              Format: challengeDraftA_data.format,
              'Réponse automatique': challengeDraftA_data.autoReply,
              Langues: challengeDraftA_data.localesAirtable,
              Focalisée: challengeDraftA_data.focusable,
              'Difficulté calculée': challengeDraftA_data.deltaAirtable,
              'Discrimination calculée': challengeDraftA_data.alphaAirtable,
              Acquix: challengeDraftA_data.skills,
              'Acquix (id persistant)': [challengeDraftA_data.skillId],
              Généalogie: challengeDraftA_data.genealogy,
              'Type péda': challengeDraftA_data.pedagogy,
              Auteur: challengeDraftA_data.author,
              Déclinable: challengeDraftA_data.declinable,
              'Version prototype': challengeDraftA_data.version,
              'Version déclinaison': challengeDraftA_data.alternativeVersion,
              'Non voyant': challengeDraftA_data.accessibility1,
              Daltonien: challengeDraftA_data.accessibility2,
              Spoil: challengeDraftA_data.spoil,
              Responsive: challengeDraftA_data.responsive,
              Géographie: challengeDraftA_data.geography,
              files: challengeDraftA_data.files,
              validated_at: challengeDraftA_data.validatedAt,
              archived_at: challengeDraftA_data.archivedAt,
              created_at: challengeDraftA_data.createdAt,
              made_obsolete_at: challengeDraftA_data.madeObsoleteAt,
              updated_at: challengeDraftA_data.updatedAt,
              shuffled: challengeDraftA_data.shuffled,
              contextualizedFields: challengeDraftA_data.contextualizedFields,
            },
            get: function (field) {
              return this.fields[field];
            },
          },
          {
            id: challengeActiveA_data.airtableId,
            fields: {
              'id persistant': challengeActiveA_data.id,
              'Record ID': challengeActiveA_data.airtableId,
              'Compétences (via tube) (id persistant)': [challengeActiveA_data.competenceId],
              "Type d'épreuve": challengeActiveA_data.type,
              'T1 - Espaces, casse & accents': challengeActiveA_data.t1StatusAirtable,
              'T2 - Ponctuation': challengeActiveA_data.t2StatusAirtable,
              "T3 - Distance d'édition": challengeActiveA_data.t3StatusAirtable,
              Statut: challengeActiveA_data.status,
              'Embed URL': challengeActiveA_data.embedUrl,
              'Embed height': challengeActiveA_data.embedHeight,
              Timer: challengeActiveA_data.timer,
              Format: challengeActiveA_data.format,
              'Réponse automatique': challengeActiveA_data.autoReply,
              Langues: challengeActiveA_data.localesAirtable,
              Focalisée: challengeActiveA_data.focusable,
              'Difficulté calculée': challengeActiveA_data.deltaAirtable,
              'Discrimination calculée': challengeActiveA_data.alphaAirtable,
              Acquix: challengeActiveA_data.skills,
              'Acquix (id persistant)': [challengeActiveA_data.skillId],
              Généalogie: challengeActiveA_data.genealogy,
              'Type péda': challengeActiveA_data.pedagogy,
              Auteur: challengeActiveA_data.author,
              Déclinable: challengeActiveA_data.declinable,
              'Version prototype': challengeActiveA_data.version,
              'Version déclinaison': challengeActiveA_data.alternativeVersion,
              'Non voyant': challengeActiveA_data.accessibility1,
              Daltonien: challengeActiveA_data.accessibility2,
              Spoil: challengeActiveA_data.spoil,
              Responsive: challengeActiveA_data.responsive,
              Géographie: challengeActiveA_data.geography,
              files: challengeActiveA_data.files,
              validated_at: challengeActiveA_data.validatedAt,
              archived_at: challengeActiveA_data.archivedAt,
              created_at: challengeActiveA_data.createdAt,
              made_obsolete_at: challengeActiveA_data.madeObsoleteAt,
              updated_at: challengeActiveA_data.updatedAt,
              shuffled: challengeActiveA_data.shuffled,
              contextualizedFields: challengeActiveA_data.contextualizedFields,
            },
            get: function (field) {
              return this.fields[field];
            },
          },
        ];
      });

      // when
      const challenges = await challengeRepository.listActiveOrDraftByCompetenceId(challengeDraftA_data.competenceId);

      // then
      expect(challenges).toStrictEqual([
        domainBuilder.buildChallenge({
          accessibility1: challengeDraftA_data.accessibility1,
          accessibility2: challengeDraftA_data.accessibility2,
          airtableId: challengeDraftA_data.airtableId,
          alternativeVersion: challengeDraftA_data.alternativeVersion,
          alpha: challengeDraftA_data.alpha,
          archivedAt: challengeDraftA_data.archivedAt,
          author: challengeDraftA_data.author,
          autoReply: challengeDraftA_data.autoReply,
          competenceId: challengeDraftA_data.competenceId,
          contextualizedFields: challengeDraftA_data.contextualizedFields,
          createdAt: challengeDraftA_data.createdAt,
          declinable: challengeDraftA_data.declinable,
          delta: challengeDraftA_data.delta,
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
          skills: challengeDraftA_data.skills,
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
        domainBuilder.buildChallenge({
          accessibility1: challengeActiveA_data.accessibility1,
          accessibility2: challengeActiveA_data.accessibility2,
          airtableId: challengeActiveA_data.airtableId,
          alternativeVersion: challengeActiveA_data.alternativeVersion,
          alpha: challengeActiveA_data.alpha,
          archivedAt: challengeActiveA_data.archivedAt,
          author: challengeActiveA_data.author,
          autoReply: challengeActiveA_data.autoReply,
          competenceId: challengeActiveA_data.competenceId,
          contextualizedFields: challengeActiveA_data.contextualizedFields,
          createdAt: challengeActiveA_data.createdAt,
          declinable: challengeActiveA_data.declinable,
          delta: challengeActiveA_data.delta,
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
          skills: challengeActiveA_data.skills,
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
      ]);
    });

    it('should return an empty array when no challenges found for provided competence id', async () => {
      // given
      vi.spyOn(airtableClient, 'findRecords').mockImplementation((tableName, options) => {
        if (tableName !== 'Epreuves') expect.unreachable('Airtable tableName should be Epreuves');
        if (
          options?.filterByFormula !==
          `AND({Compétences (via tube) (id persistant)} = "someCompetenceId", {acquis} != "${Skill.WORKBENCH_NAME}", OR({Statut} = "${Challenge.STATUSES.PROPOSE}", {Statut} = "${Challenge.STATUSES.VALIDE}"))`
        )
          expect.unreachable('Wrong filterByFormula');
        return [];
      });

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
        airtableId: 'airtableChallengeDraftA_id',
        skillId: 'skillId',
        competenceId: 'competence1',
        alpha: 1,
        alphaAirtable: '1',
        delta: 2,
        deltaAirtable: '2',
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
        skills: ['airtableSkillId'],
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
        contextualizedFields: [Challenge.CONTEXTUALIZED_FIELDS.EMBED],
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
        airtableId: 'airtableChallengeProtoB_id',
        skillId: 'skillId',
        competenceId: 'competence1',
        alpha: 1,
        alphaAirtable: '1',
        delta: 2,
        deltaAirtable: '2',
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
        skills: ['airtableSkillId'],
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
        contextualizedFields: [Challenge.CONTEXTUALIZED_FIELDS.EMBED],
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
      vi.spyOn(airtableClient, 'findRecords').mockImplementation((tableName, options) => {
        if (tableName !== 'Epreuves') expect.unreachable('Airtable tableName should be Epreuves');
        if (
          options?.filterByFormula !==
          `AND({Compétences (via tube) (id persistant)} = "${challengeProtoA_data.competenceId}", {acquis} != "${Skill.WORKBENCH_NAME}", {Généalogie} = "${Challenge.GENEALOGIES.PROTOTYPE}")`
        )
          expect.unreachable('Wrong filterByFormula');
        return [
          {
            id: challengeProtoA_data.airtableId,
            fields: {
              'id persistant': challengeProtoA_data.id,
              'Record ID': challengeProtoA_data.airtableId,
              'Compétences (via tube) (id persistant)': [challengeProtoA_data.competenceId],
              "Type d'épreuve": challengeProtoA_data.type,
              'T1 - Espaces, casse & accents': challengeProtoA_data.t1StatusAirtable,
              'T2 - Ponctuation': challengeProtoA_data.t2StatusAirtable,
              "T3 - Distance d'édition": challengeProtoA_data.t3StatusAirtable,
              Statut: challengeProtoA_data.status,
              'Embed URL': challengeProtoA_data.embedUrl,
              'Embed height': challengeProtoA_data.embedHeight,
              Timer: challengeProtoA_data.timer,
              Format: challengeProtoA_data.format,
              'Réponse automatique': challengeProtoA_data.autoReply,
              Langues: challengeProtoA_data.localesAirtable,
              Focalisée: challengeProtoA_data.focusable,
              'Difficulté calculée': challengeProtoA_data.deltaAirtable,
              'Discrimination calculée': challengeProtoA_data.alphaAirtable,
              Acquix: challengeProtoA_data.skills,
              'Acquix (id persistant)': [challengeProtoA_data.skillId],
              Généalogie: challengeProtoA_data.genealogy,
              'Type péda': challengeProtoA_data.pedagogy,
              Auteur: challengeProtoA_data.author,
              Déclinable: challengeProtoA_data.declinable,
              'Version prototype': challengeProtoA_data.version,
              'Version déclinaison': challengeProtoA_data.alternativeVersion,
              'Non voyant': challengeProtoA_data.accessibility1,
              Daltonien: challengeProtoA_data.accessibility2,
              Spoil: challengeProtoA_data.spoil,
              Responsive: challengeProtoA_data.responsive,
              Géographie: challengeProtoA_data.geography,
              files: challengeProtoA_data.files,
              filesLocalizedChallengeIds: challengeProtoA_data.filesLocalizedChallengeIds,
              validated_at: challengeProtoA_data.validatedAt,
              archived_at: challengeProtoA_data.archivedAt,
              created_at: challengeProtoA_data.createdAt,
              made_obsolete_at: challengeProtoA_data.madeObsoleteAt,
              updated_at: challengeProtoA_data.updatedAt,
              shuffled: challengeProtoA_data.shuffled,
              contextualizedFields: challengeProtoA_data.contextualizedFields,
            },
            get: function (field) {
              return this.fields[field];
            },
          },
          {
            id: challengeProtoB_data.airtableId,
            fields: {
              'id persistant': challengeProtoB_data.id,
              'Record ID': challengeProtoB_data.airtableId,
              'Compétences (via tube) (id persistant)': [challengeProtoB_data.competenceId],
              "Type d'épreuve": challengeProtoB_data.type,
              'T1 - Espaces, casse & accents': challengeProtoB_data.t1StatusAirtable,
              'T2 - Ponctuation': challengeProtoB_data.t2StatusAirtable,
              "T3 - Distance d'édition": challengeProtoB_data.t3StatusAirtable,
              Statut: challengeProtoB_data.status,
              'Embed URL': challengeProtoB_data.embedUrl,
              'Embed height': challengeProtoB_data.embedHeight,
              Timer: challengeProtoB_data.timer,
              Format: challengeProtoB_data.format,
              'Réponse automatique': challengeProtoB_data.autoReply,
              Langues: challengeProtoB_data.localesAirtable,
              Focalisée: challengeProtoB_data.focusable,
              'Difficulté calculée': challengeProtoB_data.deltaAirtable,
              'Discrimination calculée': challengeProtoB_data.alphaAirtable,
              Acquix: challengeProtoB_data.skills,
              'Acquix (id persistant)': [challengeProtoB_data.skillId],
              Généalogie: challengeProtoB_data.genealogy,
              'Type péda': challengeProtoB_data.pedagogy,
              Auteur: challengeProtoB_data.author,
              Déclinable: challengeProtoB_data.declinable,
              'Version prototype': challengeProtoB_data.version,
              'Version déclinaison': challengeProtoB_data.alternativeVersion,
              'Non voyant': challengeProtoB_data.accessibility1,
              Daltonien: challengeProtoB_data.accessibility2,
              Spoil: challengeProtoB_data.spoil,
              Responsive: challengeProtoB_data.responsive,
              Géographie: challengeProtoB_data.geography,
              files: challengeProtoB_data.files,
              validated_at: challengeProtoB_data.validatedAt,
              archived_at: challengeProtoB_data.archivedAt,
              created_at: challengeProtoB_data.createdAt,
              made_obsolete_at: challengeProtoB_data.madeObsoleteAt,
              updated_at: challengeProtoB_data.updatedAt,
              shuffled: challengeProtoB_data.shuffled,
              contextualizedFields: challengeProtoB_data.contextualizedFields,
            },
            get: function (field) {
              return this.fields[field];
            },
          },
        ];
      });

      // when
      const challenges = await challengeRepository.listPrototypesByCompetenceId(challengeProtoA_data.competenceId);

      // then
      expect(challenges).toStrictEqual([
        domainBuilder.buildChallenge({
          accessibility1: challengeProtoA_data.accessibility1,
          accessibility2: challengeProtoA_data.accessibility2,
          airtableId: challengeProtoA_data.airtableId,
          alternativeVersion: challengeProtoA_data.alternativeVersion,
          alpha: challengeProtoA_data.alpha,
          archivedAt: challengeProtoA_data.archivedAt,
          author: challengeProtoA_data.author,
          autoReply: challengeProtoA_data.autoReply,
          competenceId: challengeProtoA_data.competenceId,
          contextualizedFields: challengeProtoA_data.contextualizedFields,
          createdAt: challengeProtoA_data.createdAt,
          declinable: challengeProtoA_data.declinable,
          delta: challengeProtoA_data.delta,
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
          skills: challengeProtoA_data.skills,
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
          airtableId: challengeProtoB_data.airtableId,
          alternativeVersion: challengeProtoB_data.alternativeVersion,
          alpha: challengeProtoB_data.alpha,
          archivedAt: challengeProtoB_data.archivedAt,
          author: challengeProtoB_data.author,
          autoReply: challengeProtoB_data.autoReply,
          competenceId: challengeProtoB_data.competenceId,
          contextualizedFields: challengeProtoB_data.contextualizedFields,
          createdAt: challengeProtoB_data.createdAt,
          declinable: challengeProtoB_data.declinable,
          delta: challengeProtoB_data.delta,
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
          skills: challengeProtoB_data.skills,
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
      // given
      vi.spyOn(airtableClient, 'findRecords').mockImplementation((tableName, options) => {
        if (tableName !== 'Epreuves') expect.unreachable('Airtable tableName should be Epreuves');
        if (
          options?.filterByFormula !==
          `AND({Compétences (via tube) (id persistant)} = "someCompetenceId", {acquis} != "${Skill.WORKBENCH_NAME}", OR({Statut} = "${Challenge.STATUSES.PROPOSE}", {Statut} = "${Challenge.STATUSES.VALIDE}"))`
        )
          expect.unreachable('Wrong filterByFormula');
        return [];
      });

      // when
      const challenges = await challengeRepository.listActiveOrDraftByCompetenceId('someCompetenceId');

      // then
      expect(challenges).toStrictEqual([]);
    });
  });

  describe('#createBatch', () => {
    afterEach(async () => {
      await knex('localized_challenges').delete();
      await knex('challenges').delete();
      await knex('translations').delete();
    });

    it('should create several challenges in airtable and its localized challenges and translations in PG', async () => {
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
        airtableId: null,
        alternativeVersion: 1,
        alpha: null,
        delta: null,
        archivedAt: null,
        createdAt: null,
        validatedAt: null,
        madeObsoleteAt: null,
        updatedAt: null,
        author: ['MOI'],
        autoReply: true,
        competenceId: 'Unused competenceId',
        contextualizedFields: [Challenge.CONTEXTUALIZED_FIELDS.EMBED],
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
        skills: [],
        spoil: Challenge.SPOILS.NON_SPOILABLE,
        status: Challenge.STATUSES.PROPOSE,
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
        airtableId: null,
        alternativeVersion: 3,
        alpha: null,
        delta: null,
        archivedAt: null,
        createdAt: null,
        validatedAt: null,
        madeObsoleteAt: null,
        updatedAt: null,
        author: ['LUI'],
        autoReply: false,
        competenceId: 'Unused competenceId',
        contextualizedFields: [Challenge.CONTEXTUALIZED_FIELDS.ILLUSTRATION],
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
        skills: [],
        spoil: Challenge.SPOILS.FACILEMENT_SPOILABLE,
        status: Challenge.STATUSES.VALIDE,
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

      const airtableIdsByIds = {
        skillId1: 'airtableSkillId1',
        skillId2: 'airtableSkillId2',
      };
      vi.spyOn(skillDatasource, 'getAirtableIdsByIds').mockImplementation((necessaryChallengeIds) => {
        if (necessaryChallengeIds.join(',') !== 'skillId1,skillId2')
          expect.unreachable('Wrong skill ids for fetching corresponding airtable ids');
        return airtableIdsByIds;
      });
      vi.spyOn(airtableClient, 'createRecords').mockImplementation((tableName, airtableRequestBodies) => {
        if (tableName !== 'Epreuves') expect.unreachable('Airtable tableName should be Epreuves');
        if (
          airtableRequestBodies.length !== 2 ||
          !_.isEqual(airtableRequestBodies[0], {
            fields: {
              'id persistant': challengeA_data.id,
              "Type d'épreuve": challengeA_data.type,
              'T1 - Espaces, casse & accents': challengeA_data.t1StatusAirtable,
              'T2 - Ponctuation': challengeA_data.t2StatusAirtable,
              "T3 - Distance d'édition": challengeA_data.t3StatusAirtable,
              Statut: challengeA_data.status,
              'Embed URL': challengeA.localizedChallenges[0].embedUrl,
              'Embed height': challengeA_data.embedHeight,
              Timer: challengeA_data.timer,
              Format: challengeA_data.format,
              'Réponse automatique': challengeA_data.autoReply,
              Langues: challengeA_data.localesAirtable,
              Focalisée: challengeA_data.focusable,
              Acquix: [airtableIdsByIds[challengeA_data.skillId]],
              Généalogie: challengeA_data.genealogy,
              'Type péda': challengeA_data.pedagogy,
              Auteur: challengeA_data.author,
              Déclinable: challengeA_data.declinable,
              'Version prototype': challengeA_data.version,
              'Version déclinaison': challengeA_data.alternativeVersion,
              'Non voyant': challengeA_data.accessibility1,
              Daltonien: challengeA_data.accessibility2,
              Spoil: challengeA_data.spoil,
              Responsive: challengeA_data.responsive,
              Géographie: challengeA_data.geography,
              validated_at: challengeA_data.validatedAt,
              archived_at: challengeA_data.archivedAt,
              made_obsolete_at: challengeA_data.madeObsoleteAt,
              shuffled: challengeA_data.shuffled,
              contextualizedFields: challengeA_data.contextualizedFields,
            },
          }) ||
          !_.isEqual(airtableRequestBodies[1], {
            fields: {
              'id persistant': challengeB_data.id,
              "Type d'épreuve": challengeB_data.type,
              'T1 - Espaces, casse & accents': challengeB_data.t1StatusAirtable,
              'T2 - Ponctuation': challengeB_data.t2StatusAirtable,
              "T3 - Distance d'édition": challengeB_data.t3StatusAirtable,
              Statut: challengeB_data.status,
              'Embed URL': challengeB.localizedChallenges[0].embedUrl,
              'Embed height': challengeB_data.embedHeight,
              Timer: challengeB_data.timer,
              Format: challengeB_data.format,
              'Réponse automatique': challengeB_data.autoReply,
              Langues: challengeB_data.localesAirtable,
              Focalisée: challengeB_data.focusable,
              Acquix: [airtableIdsByIds[challengeB_data.skillId]],
              Généalogie: challengeB_data.genealogy,
              'Type péda': challengeB_data.pedagogy,
              Auteur: challengeB_data.author,
              Déclinable: challengeB_data.declinable,
              'Version prototype': challengeB_data.version,
              'Version déclinaison': challengeB_data.alternativeVersion,
              'Non voyant': challengeB_data.accessibility1,
              Daltonien: challengeB_data.accessibility2,
              Spoil: challengeB_data.spoil,
              Responsive: challengeB_data.responsive,
              Géographie: challengeA_data.geography,
              validated_at: challengeB_data.validatedAt,
              archived_at: challengeB_data.archivedAt,
              made_obsolete_at: challengeB_data.madeObsoleteAt,
              shuffled: challengeB_data.shuffled,
              contextualizedFields: challengeB_data.contextualizedFields,
            },
          })
        )
          expect.unreachable('Challenges to create to airtable wrong bodies');
        return [
          {
            id: 'airtableIdChallengeA',
            fields: {
              'id persistant': challengeA_data.id,
              'Record ID': 'airtableIdChallengeA',
              'Compétences (via tube) (id persistant)': ['theRightCompetenceId'],
              "Type d'épreuve": challengeA_data.type,
              'T1 - Espaces, casse & accents': challengeA_data.t1StatusAirtable,
              'T2 - Ponctuation': challengeA_data.t2StatusAirtable,
              "T3 - Distance d'édition": challengeA_data.t3StatusAirtable,
              Statut: challengeA_data.status,
              'Embed URL': challengeA_data.embedUrl,
              'Embed height': challengeA_data.embedHeight,
              Timer: challengeA_data.timer,
              Format: challengeA_data.format,
              'Réponse automatique': challengeA_data.autoReply,
              Langues: challengeA_data.localesAirtable,
              Focalisée: challengeA_data.focusable,
              'Difficulté calculée': NaN,
              'Discrimination calculée': NaN,
              Acquix: challengeA_data.skills,
              'Acquix (id persistant)': [challengeA_data.skillId],
              Généalogie: challengeA_data.genealogy,
              'Type péda': challengeA_data.pedagogy,
              Auteur: challengeA_data.author,
              Déclinable: challengeA_data.declinable,
              'Version prototype': challengeA_data.version,
              'Version déclinaison': challengeA_data.alternativeVersion,
              'Non voyant': challengeA_data.accessibility1,
              Daltonien: challengeA_data.accessibility2,
              Spoil: challengeA_data.spoil,
              Responsive: challengeA_data.responsive,
              Géographie: challengeA_data.geography,
              files: challengeA_data.files,
              validated_at: challengeA_data.validatedAt,
              archived_at: challengeA_data.archivedAt,
              created_at: challengeA_data.createdAt,
              made_obsolete_at: challengeA_data.madeObsoleteAt,
              updated_at: challengeA_data.updatedAt,
              shuffled: challengeA_data.shuffled,
              contextualizedFields: challengeA_data.contextualizedFields,
            },
            get: function (field) {
              return this.fields[field];
            },
          },
          {
            id: 'airtableIdChallengeB',
            fields: {
              'id persistant': challengeB_data.id,
              'Record ID': 'airtableIdChallengeB',
              'Compétences (via tube) (id persistant)': ['theRightCompetenceId'],
              "Type d'épreuve": challengeB_data.type,
              'T1 - Espaces, casse & accents': challengeB_data.t1StatusAirtable,
              'T2 - Ponctuation': challengeB_data.t2StatusAirtable,
              "T3 - Distance d'édition": challengeB_data.t3StatusAirtable,
              Statut: challengeB_data.status,
              'Embed URL': challengeB_data.embedUrl,
              'Embed height': challengeB_data.embedHeight,
              Timer: challengeB_data.timer,
              Format: challengeB_data.format,
              'Réponse automatique': challengeB_data.autoReply,
              Langues: challengeB_data.localesAirtable,
              Focalisée: challengeB_data.focusable,
              'Difficulté calculée': NaN,
              'Discrimination calculée': NaN,
              Acquix: challengeB_data.skills,
              'Acquix (id persistant)': [challengeB_data.skillId],
              Généalogie: challengeB_data.genealogy,
              'Type péda': challengeB_data.pedagogy,
              Auteur: challengeB_data.author,
              Déclinable: challengeB_data.declinable,
              'Version prototype': challengeB_data.version,
              'Version déclinaison': challengeB_data.alternativeVersion,
              'Non voyant': challengeB_data.accessibility1,
              Daltonien: challengeB_data.accessibility2,
              Spoil: challengeB_data.spoil,
              Responsive: challengeB_data.responsive,
              Géographie: challengeB_data.geography,
              files: challengeB_data.files,
              validated_at: challengeB_data.validatedAt,
              archived_at: challengeB_data.archivedAt,
              made_obsolete_at: challengeB_data.madeObsoleteAt,
              created_at: challengeB_data.createdAt,
              updated_at: challengeB_data.updatedAt,
              shuffled: challengeB_data.shuffled,
              contextualizedFields: challengeB_data.contextualizedFields,
            },
            get: function (field) {
              return this.fields[field];
            },
          },
        ];
      });

      // when
      const challenges = await challengeRepository.createBatch([challengeA, challengeB]);

      // then
      expect(challenges).toStrictEqual([
        domainBuilder.buildChallenge({
          accessibility1: challengeA_data.accessibility1,
          accessibility2: challengeA_data.accessibility2,
          airtableId: 'airtableIdChallengeA',
          alternativeVersion: challengeA_data.alternativeVersion,
          alpha: NaN,
          archivedAt: challengeA_data.archivedAt,
          author: challengeA_data.author,
          autoReply: challengeA_data.autoReply,
          competenceId: 'theRightCompetenceId',
          contextualizedFields: challengeA_data.contextualizedFields,
          createdAt: challengeA_data.createdAt,
          declinable: challengeA_data.declinable,
          delta: NaN,
          embedHeight: challengeA_data.embedHeight,
          files: challengeA_data.files,
          focusable: challengeA_data.focusable,
          format: challengeA_data.format,
          genealogy: challengeA_data.genealogy,
          geography: challengeA_data.geography,
          id: challengeA_data.id,
          locales: challengeA_data.locales,
          localizedChallenges: challengeA.localizedChallenges,
          madeObsoleteAt: challengeA_data.madeObsoleteAt,
          pedagogy: challengeA_data.pedagogy,
          responsive: challengeA_data.responsive,
          shuffled: challengeA_data.shuffled,
          skillId: challengeA_data.skillId,
          skills: challengeA_data.skills,
          spoil: challengeA_data.spoil,
          status: challengeA_data.status,
          t1Status: challengeA_data.t1Status,
          t2Status: challengeA_data.t2Status,
          t3Status: challengeA_data.t3Status,
          timer: challengeA_data.timer,
          translations: challengeA.translations,
          type: challengeA_data.type,
          updatedAt: challengeA_data.updatedAt,
          validatedAt: challengeA_data.validatedAt,
          version: challengeA_data.version,
        }),
        domainBuilder.buildChallenge({
          accessibility1: challengeB_data.accessibility1,
          accessibility2: challengeB_data.accessibility2,
          airtableId: 'airtableIdChallengeB',
          alternativeVersion: challengeB_data.alternativeVersion,
          alpha: NaN,
          archivedAt: challengeB_data.archivedAt,
          author: challengeB_data.author,
          autoReply: challengeB_data.autoReply,
          competenceId: 'theRightCompetenceId',
          contextualizedFields: challengeB_data.contextualizedFields,
          createdAt: challengeB_data.createdAt,
          declinable: challengeB_data.declinable,
          delta: NaN,
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
          skills: challengeB_data.skills,
          spoil: challengeB_data.spoil,
          status: challengeB_data.status,
          t1Status: challengeB_data.t1Status,
          t2Status: challengeB_data.t2Status,
          t3Status: challengeB_data.t3Status,
          timer: challengeB_data.timer,
          translations: challengeB.translations,
          type: challengeB_data.type,
          updatedAt: challengeB_data.updatedAt,
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
          alpha: null,
          archivedAt: challengeA_data.archivedAt,
          author: challengeA_data.author,
          autoReply: challengeA_data.autoReply,
          contextualizedFields: challengeA_data.contextualizedFields,
          createdAt: expect.any(Date),
          declinable: challengeA_data.declinable,
          delta: null,
          embedHeight: challengeA_data.embedHeight,
          focusable: challengeA_data.focusable,
          format: challengeA_data.format,
          genealogy: challengeA_data.genealogy,
          id: challengeA_data.id,
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
          alpha: null,
          archivedAt: challengeB_data.archivedAt,
          author: challengeB_data.author,
          autoReply: challengeB_data.autoReply,
          contextualizedFields: challengeB_data.contextualizedFields,
          createdAt: expect.any(Date),
          declinable: challengeB_data.declinable,
          delta: null,
          embedHeight: challengeB_data.embedHeight,
          focusable: challengeB_data.focusable,
          format: challengeB_data.format,
          genealogy: challengeB_data.genealogy,
          id: challengeB_data.id,
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
    afterEach(async () => {
      await knex.delete().from('localized_challenges');
      await knex.delete().from('challenges');
    });

    it('should create a challenge, its localized challenge primary and its translated attributes', async function () {
      // given
      const challengeToCreate_data = {
        id: 'challengeToCreate_id',
        accessibility1: Challenge.ACCESSIBILITY1.OK,
        accessibility2: Challenge.ACCESSIBILITY1.KO,
        airtableId: null,
        alternativeVersion: 1,
        alpha: null,
        delta: null,
        archivedAt: null,
        createdAt: null,
        validatedAt: null,
        madeObsoleteAt: null,
        updatedAt: null,
        author: ['MOI'],
        autoReply: true,
        competenceId: 'Unused competenceId',
        contextualizedFields: [Challenge.CONTEXTUALIZED_FIELDS.EMBED],
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
        skills: ['airtableSkillId1'],
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

      vi.spyOn(airtableClient, 'createRecord').mockImplementation((tableName, airtableRequestBody) => {
        if (tableName !== 'Epreuves') {
          expect.unreachable('Airtable tableName should be Epreuves');
        }
        if (
          !_.isEqual(airtableRequestBody, {
            fields: {
              'id persistant': challengeToCreate_data.id,
              "Type d'épreuve": challengeToCreate_data.type,
              'T1 - Espaces, casse & accents': challengeToCreate_data.t1StatusAirtable,
              'T2 - Ponctuation': challengeToCreate_data.t2StatusAirtable,
              "T3 - Distance d'édition": challengeToCreate_data.t3StatusAirtable,
              Statut: challengeToCreate_data.status,
              'Embed URL': challengeToCreate.localizedChallenges[0].embedUrl,
              'Embed height': challengeToCreate_data.embedHeight,
              Timer: challengeToCreate_data.timer,
              Format: challengeToCreate_data.format,
              'Réponse automatique': challengeToCreate_data.autoReply,
              Langues: challengeToCreate_data.localesAirtable,
              Focalisée: challengeToCreate_data.focusable,
              Acquix: challengeToCreate_data.skills,
              Généalogie: challengeToCreate_data.genealogy,
              'Type péda': challengeToCreate_data.pedagogy,
              Auteur: challengeToCreate_data.author,
              Déclinable: challengeToCreate_data.declinable,
              'Version prototype': challengeToCreate_data.version,
              'Version déclinaison': challengeToCreate_data.alternativeVersion,
              'Non voyant': challengeToCreate_data.accessibility1,
              Daltonien: challengeToCreate_data.accessibility2,
              Spoil: challengeToCreate_data.spoil,
              Responsive: challengeToCreate_data.responsive,
              Géographie: challengeToCreate_data.geography,
              validated_at: challengeToCreate_data.validatedAt,
              archived_at: challengeToCreate_data.archivedAt,
              made_obsolete_at: challengeToCreate_data.madeObsoleteAt,
              shuffled: challengeToCreate_data.shuffled,
              contextualizedFields: challengeToCreate_data.contextualizedFields,
            },
          })
        ) {
          expect.unreachable('Challenges to create to airtable wrong body');
        }
        return {
          id: 'airtableIdChallengeToCreate',
          fields: {
            'id persistant': challengeToCreate_data.id,
            'Record ID': 'airtableIdChallengeToCreate',
            'Compétences (via tube) (id persistant)': ['theRightCompetenceId'],
            "Type d'épreuve": challengeToCreate_data.type,
            'T1 - Espaces, casse & accents': challengeToCreate_data.t1StatusAirtable,
            'T2 - Ponctuation': challengeToCreate_data.t2StatusAirtable,
            "T3 - Distance d'édition": challengeToCreate_data.t3StatusAirtable,
            Statut: challengeToCreate_data.status,
            'Embed URL': challengeToCreate_data.embedUrl,
            'Embed height': challengeToCreate_data.embedHeight,
            Timer: challengeToCreate_data.timer,
            Format: challengeToCreate_data.format,
            'Réponse automatique': challengeToCreate_data.autoReply,
            Langues: challengeToCreate_data.localesAirtable,
            Focalisée: challengeToCreate_data.focusable,
            'Difficulté calculée': NaN,
            'Discrimination calculée': NaN,
            Acquix: challengeToCreate_data.skills,
            'Acquix (id persistant)': [challengeToCreate_data.skillId],
            Généalogie: challengeToCreate_data.genealogy,
            'Type péda': challengeToCreate_data.pedagogy,
            Auteur: challengeToCreate_data.author,
            Déclinable: challengeToCreate_data.declinable,
            'Version prototype': challengeToCreate_data.version,
            'Version déclinaison': challengeToCreate_data.alternativeVersion,
            'Non voyant': challengeToCreate_data.accessibility1,
            Daltonien: challengeToCreate_data.accessibility2,
            Spoil: challengeToCreate_data.spoil,
            Responsive: challengeToCreate_data.responsive,
            Géographie: challengeToCreate_data.geography,
            files: challengeToCreate_data.files,
            validated_at: challengeToCreate_data.validatedAt,
            archived_at: challengeToCreate_data.archivedAt,
            created_at: challengeToCreate_data.createdAt,
            made_obsolete_at: challengeToCreate_data.madeObsoleteAt,
            updated_at: challengeToCreate_data.updatedAt,
            shuffled: challengeToCreate_data.shuffled,
            contextualizedFields: challengeToCreate_data.contextualizedFields,
          },
          get: function (field) {
            return this.fields[field];
          },
        };
      });

      // when
      const challenge = await challengeRepository.create(challengeToCreate);

      // then
      expect(challenge).toStrictEqual(
        domainBuilder.buildChallenge({
          accessibility1: challengeToCreate_data.accessibility1,
          accessibility2: challengeToCreate_data.accessibility2,
          airtableId: 'airtableIdChallengeToCreate',
          alternativeVersion: challengeToCreate_data.alternativeVersion,
          alpha: NaN,
          archivedAt: challengeToCreate_data.archivedAt,
          author: challengeToCreate_data.author,
          autoReply: challengeToCreate_data.autoReply,
          competenceId: 'theRightCompetenceId',
          contextualizedFields: challengeToCreate_data.contextualizedFields,
          createdAt: challengeToCreate_data.createdAt,
          declinable: challengeToCreate_data.declinable,
          delta: NaN,
          embedHeight: challengeToCreate_data.embedHeight,
          files: challengeToCreate_data.files,
          focusable: challengeToCreate_data.focusable,
          format: challengeToCreate_data.format,
          genealogy: challengeToCreate_data.genealogy,
          geography: challengeToCreate_data.geography,
          id: challengeToCreate_data.id,
          locales: challengeToCreate_data.locales,
          localizedChallenges: challengeToCreate.localizedChallenges,
          madeObsoleteAt: challengeToCreate_data.madeObsoleteAt,
          pedagogy: challengeToCreate_data.pedagogy,
          responsive: challengeToCreate_data.responsive,
          shuffled: challengeToCreate_data.shuffled,
          skillId: challengeToCreate_data.skillId,
          skills: challengeToCreate_data.skills,
          spoil: challengeToCreate_data.spoil,
          status: challengeToCreate_data.status,
          t1Status: challengeToCreate_data.t1Status,
          t2Status: challengeToCreate_data.t2Status,
          t3Status: challengeToCreate_data.t3Status,
          timer: challengeToCreate_data.timer,
          translations: challengeToCreate.translations,
          type: challengeToCreate_data.type,
          updatedAt: challengeToCreate_data.updatedAt,
          validatedAt: challengeToCreate_data.validatedAt,
          version: challengeToCreate_data.version,
        }),
      );

      await expect(knex.select('*').from('challenges')).resolves.toStrictEqual([
        {
          accessibility1: challengeToCreate_data.accessibility1,
          accessibility2: challengeToCreate_data.accessibility2,
          alternativeVersion: challengeToCreate_data.alternativeVersion,
          alpha: null,
          archivedAt: challengeToCreate_data.archivedAt,
          author: challengeToCreate_data.author,
          autoReply: challengeToCreate_data.autoReply,
          contextualizedFields: challengeToCreate_data.contextualizedFields,
          createdAt: expect.any(Date),
          declinable: challengeToCreate_data.declinable,
          delta: null,
          embedHeight: challengeToCreate_data.embedHeight,
          focusable: challengeToCreate_data.focusable,
          format: challengeToCreate_data.format,
          genealogy: challengeToCreate_data.genealogy,
          id: challengeToCreate_data.id,
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
          id: challengeToCreate_data.id,
          challengeId: challengeToCreate_data.id,
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
          key: 'challenge.challengeToCreate_id.instruction',
          locale: 'fr',
          value: 'instruction FR challengeToCreate',
        },
        {
          key: 'challenge.challengeToCreate_id.solution',
          locale: 'fr',
          value: 'solution FR challengeToCreate',
        },
        {
          key: 'challenge.challengeToCreate_id.alternativeInstruction',
          locale: 'fr',
          value: 'alternativeInstruction FR challengeToCreate',
        },
        {
          key: 'challenge.challengeToCreate_id.proposals',
          locale: 'fr',
          value: 'proposals FR challengeToCreate',
        },
        {
          key: 'challenge.challengeToCreate_id.solutionToDisplay',
          locale: 'fr',
          value: 'solutionToDisplay FR challengeToCreate',
        },
        {
          key: 'challenge.challengeToCreate_id.embedTitle',
          locale: 'fr',
          value: 'embedTitle FR challengeToCreate',
        },
        {
          key: 'challenge.challengeToCreate_id.illustrationAlt',
          locale: 'fr',
          value: 'illustrationAlt FR challengeToCreate',
        },
      ]);
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

      const airtableChallenges = expectedChallenges.map((challenge) =>
        airtableBuilder.factory.buildChallenge(challenge),
      );
      const findRecordsSpy = vi
        .spyOn(airtable, 'findRecords')
        .mockResolvedValueOnce(
          airtableChallenges.map(
            (airtableChallenge) =>
              new Airtable.Record(challengeDatasource.tableName, airtableChallenge.airtableId, airtableChallenge),
          ),
        );
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
      expect(findRecordsSpy).toHaveBeenCalledWith(challengeDatasource.tableName, {
        filterByFormula:
          'AND(OR({Acquis (id persistant)} = "skillId1", {Acquis (id persistant)} = "skillId2"), {Généalogie} = "Prototype 1", {Statut} = "validé")',
        fields: challengeDatasource.usedFields,
      });
    });
  });
});

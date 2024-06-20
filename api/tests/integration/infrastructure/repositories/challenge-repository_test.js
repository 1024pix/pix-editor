import { afterEach, describe, expect, it, vi } from 'vitest';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import * as airtableClient from '../../../../lib/infrastructure/airtable.js';
import { Challenge, LocalizedChallenge } from '../../../../lib/domain/models/index.js';
import * as challengeRepository from '../../../../lib/infrastructure/repositories/challenge-repository.js';
import { skillDatasource } from '../../../../lib/infrastructure/datasources/airtable/index.js';
import _ from 'lodash';

describe('Integration | Repository | challenge-repository', () => {

  afterEach(() => {
    vi.restoreAllMocks();
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
        embedHeight: 'embedHeight challengeA',
        timer: 789,
        format: 'format challengeA',
        autoReply: false,
        localesAirtable: ['Francophone'],
        locales: ['fr'],
        focusable: 'focusable challengeA',
        skills: ['airtableSkillId'],
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
        author: 'author challengeA',
        declinable: Challenge.DECLINABLES.FACILEMENT,
        version: 'version challengeA',
        alternativeVersion: 'alternativeVersion challengeA',
        accessibility1: 'accessibility1 challengeA',
        accessibility2: 'accessibility2 challengeA',
        spoil: 'spoil challengeA',
        responsive: 'responsive challengeA',
        geography: 'geography challengeA',
        files: [],
        validatedAt: null,
        archivedAt: null,
        createdAt: null,
        updatedAt: null,
        madeObsoleteAt: null,
        shuffled: 'shuffled challengeA',
        contextualizedFields: 'contextualizedFields challengeA',
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
      databaseBuilder.factory.buildLocalizedChallengeAttachment({
        localizedChallengeId: 'challengeA_id',
        attachmentId: 'attachmentA',
      });
      databaseBuilder.factory.buildLocalizedChallengeAttachment({
        localizedChallengeId: 'locES_challengeA_id',
        attachmentId: 'attachmentB',
      });
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
        embedHeight: 'embedHeight challengeB',
        timer: 145,
        format: 'format challengeB',
        autoReply: true,
        localesAirtable: ['Francophone'],
        locales: ['fr'],
        focusable: 'focusable challengeB',
        skills: ['airtableSkillId'],
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        pedagogy: Challenge.PEDAGOGIES.Q_SAVOIR,
        author: 'author challengeB',
        declinable: Challenge.DECLINABLES.NON,
        version: 'version challengeB',
        alternativeVersion: 'alternativeVersion challengeB',
        accessibility1: 'accessibility1 challengeB',
        accessibility2: 'accessibility2 challengeB',
        spoil: 'spoil challengeB',
        responsive: 'responsive challengeB',
        geography: 'geography challengeB',
        files: [],
        validatedAt: null,
        archivedAt: null,
        createdAt: null,
        madeObsoleteAt: null,
        updatedAt: null,
        shuffled: 'shuffled challengeB',
        contextualizedFields: 'contextualizedFields challengeB',
      };
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
        if (options?.filterByFormula !== 'FIND("skillId", ARRAYJOIN({Acquix (id persistant)}))') expect.unreachable('Wrong filterByFormula');
        return [
          {
            id: challengeA_data.airtableId,
            fields: {
              'id persistant': challengeA_data.id,
              'Record ID': challengeA_data.airtableId,
              'Compétences (via tube) (id persistant)': [challengeA_data.competenceId],
              'Type d\'épreuve': challengeA_data.type,
              'T1 - Espaces, casse & accents': challengeA_data.t1StatusAirtable,
              'T2 - Ponctuation': challengeA_data.t2StatusAirtable,
              'T3 - Distance d\'édition': challengeA_data.t3StatusAirtable,
              'Statut': challengeA_data.status,
              'Embed URL': challengeA_data.embedUrl,
              'Embed height': challengeA_data.embedHeight,
              'Timer': challengeA_data.timer,
              'Format': challengeA_data.format,
              'Réponse automatique': challengeA_data.autoReply,
              'Langues': challengeA_data.localesAirtable,
              'Focalisée': challengeA_data.focusable,
              'Difficulté calculée': challengeA_data.deltaAirtable,
              'Discrimination calculée': challengeA_data.alphaAirtable,
              'Acquix': challengeA_data.skills,
              'Acquix (id persistant)': [challengeA_data.skillId],
              'Généalogie': challengeA_data.genealogy,
              'Type péda': challengeA_data.pedagogy,
              'Auteur': challengeA_data.author,
              'Déclinable': challengeA_data.declinable,
              'Version prototype': challengeA_data.version,
              'Version déclinaison': challengeA_data.alternativeVersion,
              'Non voyant': challengeA_data.accessibility1,
              'Daltonien': challengeA_data.accessibility2,
              'Spoil': challengeA_data.spoil,
              'Responsive': challengeA_data.responsive,
              'Géographie': challengeA_data.geography,
              'files': challengeA_data.files,
              'validated_at': challengeA_data.validatedAt,
              'archived_at': challengeA_data.archivedAt,
              'created_at': challengeA_data.createdAt,
              'made_obsolete_at': challengeA_data.madeObsoleteAt,
              'updated_at': challengeA_data.updatedAt,
              'shuffled': challengeA_data.shuffled,
              'contextualizedFields': challengeA_data.contextualizedFields,
            },
            get: function(field) { return this.fields[field]; },
          },
          {
            id: challengeB_data.airtableId,
            fields: {
              'id persistant': challengeB_data.id,
              'Record ID': challengeB_data.airtableId,
              'Compétences (via tube) (id persistant)': [challengeB_data.competenceId],
              'Type d\'épreuve': challengeB_data.type,
              'T1 - Espaces, casse & accents': challengeB_data.t1StatusAirtable,
              'T2 - Ponctuation': challengeB_data.t2StatusAirtable,
              'T3 - Distance d\'édition': challengeB_data.t3StatusAirtable,
              'Statut': challengeB_data.status,
              'Embed URL': challengeB_data.embedUrl,
              'Embed height': challengeB_data.embedHeight,
              'Timer': challengeB_data.timer,
              'Format': challengeB_data.format,
              'Réponse automatique': challengeB_data.autoReply,
              'Langues': challengeB_data.localesAirtable,
              'Focalisée': challengeB_data.focusable,
              'Difficulté calculée': challengeB_data.deltaAirtable,
              'Discrimination calculée': challengeB_data.alphaAirtable,
              'Acquix': challengeB_data.skills,
              'Acquix (id persistant)': [challengeB_data.skillId],
              'Généalogie': challengeB_data.genealogy,
              'Type péda': challengeB_data.pedagogy,
              'Auteur': challengeB_data.author,
              'Déclinable': challengeB_data.declinable,
              'Version prototype': challengeB_data.version,
              'Version déclinaison': challengeB_data.alternativeVersion,
              'Non voyant': challengeB_data.accessibility1,
              'Daltonien': challengeB_data.accessibility2,
              'Spoil': challengeB_data.spoil,
              'Responsive': challengeB_data.responsive,
              'Géographie': challengeB_data.geography,
              'files': challengeB_data.files,
              'validated_at': challengeB_data.validatedAt,
              'archived_at': challengeB_data.archivedAt,
              'made_obsolete_at': challengeB_data.madeObsoleteAt,
              'created_at': challengeB_data.createdAt,
              'updated_at': challengeB_data.updatedAt,
              'shuffled': challengeB_data.shuffled,
              'contextualizedFields': challengeB_data.contextualizedFields,
            },
            get: function(field) { return this.fields[field]; },
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
          translations: { fr: { instruction: 'instruction FR challengeA', solution: 'solution FR challengeA' }, es: { instruction : 'instruction ES challengeA' } },
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
          translations: { fr: { instruction: 'instruction FR challengeB', proposals: 'proposals FR challengeB' } },
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
        if (options?.filterByFormula !== 'FIND("someSkillId", ARRAYJOIN({Acquix (id persistant)}))') expect.unreachable('Wrong filterByFormula');
        return [];
      });

      // when
      const challenges = await challengeRepository.listBySkillId('someSkillId');

      // then
      expect(challenges).toStrictEqual([]);
    });
  });

  describe('#createBatch', () => {

    afterEach(async () => {
      await knex('localized_challenges-attachments').del();
      await knex('localized_challenges').del();
      return knex('translations').del();
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
      });
      const challengeA_data = {
        id: 'challengeA_id',
        accessibility1: 'accessibility1 challengeA',
        accessibility2: 'accessibility1 challengeA',
        airtableId: null,
        alternativeVersion: 1,
        alpha: null,
        delta: null,
        archivedAt: null,
        createdAt: null,
        validatedAt: null,
        madeObsoleteAt: null,
        updatedAt: null,
        author: 'MOI',
        autoReply: true,
        competenceId: 'Unused competenceId',
        contextualizedFields: 'contextualizedFields challengeA',
        declinable: Challenge.DECLINABLES.FACILEMENT,
        embedHeight: 'embedHeight challengeA',
        files: [],
        focusable: 'focusable challengeA',
        format: 'format challengeA',
        genealogy: Challenge.GENEALOGIES.PROTOTYPE,
        geography: 'France',
        locales: ['fr'],
        localesAirtable: ['Francophone'],
        pedagogy: Challenge.PEDAGOGIES.Q_SITUATION,
        responsive: 'responsive challengeA',
        shuffled: 'shuffled challengeA',
        skillId: 'skillId1',
        skills: [],
        spoil: 'spoil challengeA',
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
        translations: { fr: { instruction: 'instruction FR challengeA', solution: 'solution FR challengeA' }, nl: { instruction : 'instruction NL challengeA' } },
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
      });
      const challengeB_data = {
        id: 'challengeB_id',
        accessibility1: 'accessibility1 challengeB',
        accessibility2: 'accessibility1 challengeB',
        airtableId: null,
        alternativeVersion: 3,
        alpha: null,
        delta: null,
        archivedAt: null,
        createdAt: null,
        validatedAt: null,
        madeObsoleteAt: null,
        updatedAt: null,
        author: 'LUI',
        autoReply: false,
        competenceId: 'Unused competenceId',
        contextualizedFields: 'contextualizedFields challengeB',
        declinable: Challenge.DECLINABLES.NON,
        embedHeight: 'embedHeight challengeB',
        files: [],
        focusable: 'focusable challengeB',
        format: 'format challengeB',
        genealogy: Challenge.GENEALOGIES.DECLINAISON,
        geography: 'France',
        locales: ['fr'],
        localesAirtable: ['Francophone'],
        pedagogy: Challenge.PEDAGOGIES.Q_SAVOIR,
        responsive: 'responsive challengeB',
        shuffled: 'shuffled challengeB',
        skillId: 'skillId2',
        skills: [],
        spoil: 'spoil challengeB',
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
        translations: { fr: { instruction: 'instruction FR challengeB', proposals: 'proposals FR challengeB' } },
      });
      const airtableIdsByIds = {
        'skillId1': 'airtableSkillId1',
        'skillId2': 'airtableSkillId2',
      };
      vi.spyOn(skillDatasource, 'getAirtableIdsByIds').mockImplementation((necessaryChallengeIds) => {
        if (necessaryChallengeIds.join(',') !== 'skillId1,skillId2')
          expect.unreachable('Wrong skill ids for fetching corresponding airtable ids');
        return airtableIdsByIds;
      });
      vi.spyOn(airtableClient, 'createRecords').mockImplementation((tableName, airtableRequestBodies) => {
        if (tableName !== 'Epreuves') expect.unreachable('Airtable tableName should be Epreuves');
        if (
          airtableRequestBodies.length !== 2
          || !_.isEqual(airtableRequestBodies[0], { fields: {
            'id persistant': challengeA_data.id,
            'Type d\'épreuve': challengeA_data.type,
            'T1 - Espaces, casse & accents': challengeA_data.t1StatusAirtable,
            'T2 - Ponctuation': challengeA_data.t2StatusAirtable,
            'T3 - Distance d\'édition': challengeA_data.t3StatusAirtable,
            'Statut': challengeA_data.status,
            'Embed URL': challengeA.localizedChallenges[0].embedUrl,
            'Embed height': challengeA_data.embedHeight,
            'Timer': challengeA_data.timer,
            'Format': challengeA_data.format,
            'Réponse automatique': challengeA_data.autoReply,
            'Langues': challengeA_data.localesAirtable,
            'Focalisée': challengeA_data.focusable,
            'Acquix': [airtableIdsByIds[challengeA_data.skillId]],
            'Généalogie': challengeA_data.genealogy,
            'Type péda': challengeA_data.pedagogy,
            'Auteur': challengeA_data.author,
            'Déclinable': challengeA_data.declinable,
            'Version prototype': challengeA_data.version,
            'Version déclinaison': challengeA_data.alternativeVersion,
            'Non voyant': challengeA_data.accessibility1,
            'Daltonien': challengeA_data.accessibility2,
            'Spoil': challengeA_data.spoil,
            'Responsive': challengeA_data.responsive,
            'Géographie': challengeA_data.geography,
            'files': challengeA_data.files,
            'validated_at': challengeA_data.validatedAt,
            'archived_at': challengeA_data.archivedAt,
            'made_obsolete_at': challengeA_data.madeObsoleteAt,
            'shuffled': challengeA_data.shuffled,
            'contextualizedFields': challengeA_data.contextualizedFields,
          },
          })
          || !_.isEqual(airtableRequestBodies[1], { fields: {
            'id persistant': challengeB_data.id,
            'Type d\'épreuve': challengeB_data.type,
            'T1 - Espaces, casse & accents': challengeB_data.t1StatusAirtable,
            'T2 - Ponctuation': challengeB_data.t2StatusAirtable,
            'T3 - Distance d\'édition': challengeB_data.t3StatusAirtable,
            'Statut': challengeB_data.status,
            'Embed URL': challengeB.localizedChallenges[0].embedUrl,
            'Embed height': challengeB_data.embedHeight,
            'Timer': challengeB_data.timer,
            'Format': challengeB_data.format,
            'Réponse automatique': challengeB_data.autoReply,
            'Langues': challengeB_data.localesAirtable,
            'Focalisée': challengeB_data.focusable,
            'Acquix': [airtableIdsByIds[challengeB_data.skillId]],
            'Généalogie': challengeB_data.genealogy,
            'Type péda': challengeB_data.pedagogy,
            'Auteur': challengeB_data.author,
            'Déclinable': challengeB_data.declinable,
            'Version prototype': challengeB_data.version,
            'Version déclinaison': challengeB_data.alternativeVersion,
            'Non voyant': challengeB_data.accessibility1,
            'Daltonien': challengeB_data.accessibility2,
            'Spoil': challengeB_data.spoil,
            'Responsive': challengeB_data.responsive,
            'Géographie': challengeA_data.geography,
            'files': challengeB_data.files,
            'validated_at': challengeB_data.validatedAt,
            'archived_at': challengeB_data.archivedAt,
            'made_obsolete_at': challengeB_data.madeObsoleteAt,
            'shuffled': challengeB_data.shuffled,
            'contextualizedFields': challengeB_data.contextualizedFields,
          },
          })
        ) expect.unreachable('Challenges to create to airtable wrong bodies');
        return [
          {
            id: 'airtableIdChallengeA',
            fields: {
              'id persistant': challengeA_data.id,
              'Record ID': 'airtableIdChallengeA',
              'Compétences (via tube) (id persistant)': ['theRightCompetenceId'],
              'Type d\'épreuve': challengeA_data.type,
              'T1 - Espaces, casse & accents': challengeA_data.t1StatusAirtable,
              'T2 - Ponctuation': challengeA_data.t2StatusAirtable,
              'T3 - Distance d\'édition': challengeA_data.t3StatusAirtable,
              'Statut': challengeA_data.status,
              'Embed URL': challengeA_data.embedUrl,
              'Embed height': challengeA_data.embedHeight,
              'Timer': challengeA_data.timer,
              'Format': challengeA_data.format,
              'Réponse automatique': challengeA_data.autoReply,
              'Langues': challengeA_data.localesAirtable,
              'Focalisée': challengeA_data.focusable,
              'Difficulté calculée': NaN,
              'Discrimination calculée': NaN,
              'Acquix': challengeA_data.skills,
              'Acquix (id persistant)': [challengeA_data.skillId],
              'Généalogie': challengeA_data.genealogy,
              'Type péda': challengeA_data.pedagogy,
              'Auteur': challengeA_data.author,
              'Déclinable': challengeA_data.declinable,
              'Version prototype': challengeA_data.version,
              'Version déclinaison': challengeA_data.alternativeVersion,
              'Non voyant': challengeA_data.accessibility1,
              'Daltonien': challengeA_data.accessibility2,
              'Spoil': challengeA_data.spoil,
              'Responsive': challengeA_data.responsive,
              'Géographie': challengeA_data.geography,
              'files': challengeA_data.files,
              'validated_at': challengeA_data.validatedAt,
              'archived_at': challengeA_data.archivedAt,
              'created_at': challengeA_data.createdAt,
              'made_obsolete_at': challengeA_data.madeObsoleteAt,
              'updated_at': challengeA_data.updatedAt,
              'shuffled': challengeA_data.shuffled,
              'contextualizedFields': challengeA_data.contextualizedFields,
            },
            get: function(field) { return this.fields[field]; },
          },
          {
            id: 'airtableIdChallengeB',
            fields: {
              'id persistant': challengeB_data.id,
              'Record ID': 'airtableIdChallengeB',
              'Compétences (via tube) (id persistant)': ['theRightCompetenceId'],
              'Type d\'épreuve': challengeB_data.type,
              'T1 - Espaces, casse & accents': challengeB_data.t1StatusAirtable,
              'T2 - Ponctuation': challengeB_data.t2StatusAirtable,
              'T3 - Distance d\'édition': challengeB_data.t3StatusAirtable,
              'Statut': challengeB_data.status,
              'Embed URL': challengeB_data.embedUrl,
              'Embed height': challengeB_data.embedHeight,
              'Timer': challengeB_data.timer,
              'Format': challengeB_data.format,
              'Réponse automatique': challengeB_data.autoReply,
              'Langues': challengeB_data.localesAirtable,
              'Focalisée': challengeB_data.focusable,
              'Difficulté calculée': NaN,
              'Discrimination calculée': NaN,
              'Acquix': challengeB_data.skills,
              'Acquix (id persistant)': [challengeB_data.skillId],
              'Généalogie': challengeB_data.genealogy,
              'Type péda': challengeB_data.pedagogy,
              'Auteur': challengeB_data.author,
              'Déclinable': challengeB_data.declinable,
              'Version prototype': challengeB_data.version,
              'Version déclinaison': challengeB_data.alternativeVersion,
              'Non voyant': challengeB_data.accessibility1,
              'Daltonien': challengeB_data.accessibility2,
              'Spoil': challengeB_data.spoil,
              'Responsive': challengeB_data.responsive,
              'Géographie': challengeB_data.geography,
              'files': challengeB_data.files,
              'validated_at': challengeB_data.validatedAt,
              'archived_at': challengeB_data.archivedAt,
              'made_obsolete_at': challengeB_data.madeObsoleteAt,
              'created_at': challengeB_data.createdAt,
              'updated_at': challengeB_data.updatedAt,
              'shuffled': challengeB_data.shuffled,
              'contextualizedFields': challengeB_data.contextualizedFields,
            },
            get: function(field) { return this.fields[field]; },
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
      const allLocalizedChallenges = await knex('localized_challenges')
        .select('*')
        .orderBy(['challengeId', 'id']);
      expect(allLocalizedChallenges).toStrictEqual([
        {
          id: challengeA_data.id,
          challengeId: challengeA_data.id,
          embedUrl: primaryLocalizedChallenge_challengeA.embedUrl,
          locale: primaryLocalizedChallenge_challengeA.locale,
          status: primaryLocalizedChallenge_challengeA.status,
          geography: primaryLocalizedChallenge_challengeA.geography,
          urlsToConsult: primaryLocalizedChallenge_challengeA.urlsToConsult,
        },
        {
          id: localizedChallengeNL_challengeA.id,
          challengeId: challengeA_data.id,
          embedUrl: localizedChallengeNL_challengeA.embedUrl,
          locale: localizedChallengeNL_challengeA.locale,
          status: localizedChallengeNL_challengeA.status,
          geography: localizedChallengeNL_challengeA.geography,
          urlsToConsult: localizedChallengeNL_challengeA.urlsToConsult,
        },
        {
          id: challengeB_data.id,
          challengeId: challengeB_data.id,
          embedUrl: primaryLocalizedChallenge_challengeB.embedUrl,
          locale: primaryLocalizedChallenge_challengeB.locale,
          status: primaryLocalizedChallenge_challengeB.status,
          geography: primaryLocalizedChallenge_challengeB.geography,
          urlsToConsult: primaryLocalizedChallenge_challengeB.urlsToConsult,
        },
      ]);
      const allLocalizedChallengesAttachments = await knex('localized_challenges-attachments')
        .select('*');
      expect(allLocalizedChallengesAttachments.length).toStrictEqual(0);
      const allTranslations = await knex('translations')
        .select('*')
        .orderBy(['key', 'locale']);
      expect(allTranslations).toStrictEqual([
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
});

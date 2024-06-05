import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { airtableBuilder, databaseBuilder, domainBuilder, knex } from '../test-helper.js';
import Airtable from 'airtable';
import nock from 'nock';
import { Challenge, Skill } from '../../lib/domain/models/index.js';
import { moveToFocus } from '../../scripts/move-skills-to-focus/index.js';
import {
  attachmentRepository,
  challengeRepository,
  skillRepository
} from '../../lib/infrastructure/repositories/index.js';
import * as idGenerator from '../../lib/infrastructure/utils/id-generator.js';

describe('Script | Move skills to focus', function() {

  let airtableClient;

  beforeEach(() => {
    nock('https://api.airtable.com')
      .get(/^\/v0\/airtableBaseValue\/translations\?.*/)
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .optionally()
      .reply(404);

    airtableClient = new Airtable({
      apiKey: 'airtableApiKeyValue',
    }).base('airtableBaseValue');

    vi.spyOn(challengeRepository, 'listBySkillId');
    vi.spyOn(challengeRepository, 'update');
    vi.spyOn(challengeRepository, 'createBatch');
    vi.spyOn(challengeRepository, 'updateBatch');
    vi.spyOn(skillRepository, 'listByTubeId');
    vi.spyOn(skillRepository, 'create');
    vi.spyOn(skillRepository, 'update');
    vi.spyOn(idGenerator, 'generateNewId');
    vi.spyOn(attachmentRepository, 'listByChallengeIds');
    vi.spyOn(attachmentRepository, 'createBatch');
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await knex('translations').truncate();
  });

  describe('for enConstruction skills', () => {
    it('should alter appropriate challenges from enConstruction skills to focus', async function() {
      // given
      const enConstructionSkill = airtableBuilder.factory.buildSkill({
        id: 'enConstructionSkillId',
        status: Skill.STATUSES.EN_CONSTRUCTION,
      });
      const archiveSkill = airtableBuilder.factory.buildSkill({
        id: 'archiveSkillId',
        status: Skill.STATUSES.ARCHIVE,
      });
      const perimeSkill = airtableBuilder.factory.buildSkill({
        id: 'perimeSkillId',
        status: Skill.STATUSES.PERIME,
      });
      nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .query(true)
        .times(2)
        .reply(200, { records: [enConstructionSkill, archiveSkill, perimeSkill] });

      const challenges = [
        domainBuilder.buildChallenge({
          id: 'proposeChallengeForArchiveSkillId',
          status: Challenge.STATUSES.PROPOSE,
          skillId: 'archiveSkillId',
          focusable: false,
        }),
        domainBuilder.buildChallenge({
          id: 'proposeChallengeForPerimeSkillId',
          status: Challenge.STATUSES.PROPOSE,
          skillId: 'perimeSkillId',
          focusable: false,
        }),
        domainBuilder.buildChallenge({
          id: 'proposeChallengeForEnConstructionSkillId',
          status: Challenge.STATUSES.PROPOSE,
          skillId: 'enConstructionSkillId',
          focusable: false,
        }),
        domainBuilder.buildChallenge({
          id: 'archiveChallengeForEnConstructionSkillId',
          status: Challenge.STATUSES.ARCHIVE,
          skillId: 'enConstructionSkillId',
          focusable: false,
        }),
        domainBuilder.buildChallenge({
          id: 'perimeChallengeForEnConstructionSkillId',
          status: Challenge.STATUSES.PERIME,
          skillId: 'enConstructionSkillId',
          focusable: false,
        }),
      ];

      challengeRepository.listBySkillId
        .mockImplementation((skillId) => challenges.filter((challenge) => challenge.skillId === skillId));
      challengeRepository.update
        .mockImplementation(() => true);

      // when
      await moveToFocus({ airtableClient, dryRun: false });

      // then
      expect(challengeRepository.update).toHaveBeenCalledTimes(1);
      expect(challengeRepository.update).toHaveBeenCalledWith(
        domainBuilder.buildChallenge({
          id: 'proposeChallengeForEnConstructionSkillId',
          status: Challenge.STATUSES.PROPOSE,
          skillId: 'enConstructionSkillId',
          focusable: true,
        }));
    });
  });

  describe('for actif skills', () => {
    const archivedAtDate = new Date('2021-10-29T03:03:00Z');

    beforeEach(() => {
      challengeRepository.update.mockImplementation(() => true);
      skillRepository.create.mockImplementation(() => true);
      skillRepository.update.mockImplementation(() => true);
      challengeRepository.createBatch.mockImplementation(() => true);
      challengeRepository.updateBatch.mockImplementation(() => true);
      attachmentRepository.createBatch.mockImplementation(() => true);
      vi.useFakeTimers();
      vi.setSystemTime(archivedAtDate);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should clone skill and set status to actif', async () => {
      // given
      idGenerator.generateNewId.mockImplementation(() => 'skillNewId');
      const actifSkillData = {
        id: 'actifSkillId',
        description: 'la description de mon acquis',
        hintStatus: 'some hint status',
        status: Skill.STATUSES.ACTIF,
        tubeId: 'tubeId',
        competenceId: 'competenceId',
        version: 2,
        level: 1,
        name: '@baseTube1',
        tutorialIds: ['monTuto1Id'],
        learningMoreTutorialIds: ['monTuto2Id'],
        internationalisation: 'France',
      };
      const actifSkill = airtableBuilder.factory.buildSkill(actifSkillData);
      databaseBuilder.factory.buildTranslation({
        key: 'skill.actifSkillId.hint',
        locale: 'fr',
        value: 'hint fr',
      });
      databaseBuilder.factory.buildTranslation({
        key: 'skill.actifSkillId.hint',
        locale: 'en',
        value: 'hint en',
      });
      await databaseBuilder.commit();
      const archiveSkill = airtableBuilder.factory.buildSkill({
        id: 'archiveSkillId',
        status: Skill.STATUSES.ARCHIVE,
      });
      const perimeSkill = airtableBuilder.factory.buildSkill({
        id: 'perimeSkillId',
        status: Skill.STATUSES.PERIME,
      });
      // mock des deux premiers appels : 1. récupérer les acquis à focus, 2. récupérer tous les acquis
      nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .query(true)
        .times(2)
        .reply(200, { records: [actifSkill, archiveSkill, perimeSkill] });

      skillRepository.listByTubeId.mockImplementation(() => [
        domainBuilder.buildSkill({ level: 1, version: 1 }),
        domainBuilder.buildSkill({ level: 1, version: 2 }),
        domainBuilder.buildSkill({ level: 4, version: 1 }),
      ]);

      vi.spyOn(challengeRepository, 'listBySkillId')
        .mockImplementation(() => []);

      // when
      await moveToFocus({ airtableClient, dryRun: false });

      // then
      expect(skillRepository.create).toHaveBeenCalledTimes(1);
      expect(skillRepository.create).toHaveBeenCalledWith(domainBuilder.buildSkill({
        id: 'skillNewId',
        name: actifSkillData.name,
        description: actifSkillData.description,
        hint_i18n: { fr: 'hint fr', en: 'hint en' },
        hintStatus: actifSkillData.hintStatus,
        tutorialIds: actifSkillData.tutorialIds,
        learningMoreTutorialIds: actifSkillData.learningMoreTutorialIds,
        competenceId: actifSkillData.competenceId,
        pixValue: null,
        status: Skill.STATUSES.ACTIF,
        tubeId: actifSkillData.tubeId,
        level: actifSkillData.level,
        internationalisation: actifSkillData.internationalisation,
        version: 3,
      }));
    });

    it('should clone challenges (valide proto and valide/propose déclis), make them focusable and set status to what it was before cloning', async () => {
      // given
      idGenerator.generateNewId
        .mockImplementationOnce(() => 'skillNewId')
        .mockImplementationOnce(() => 'valideProtoForActifSkillNewId')
        .mockImplementationOnce(() => 'valideProtoForActifSkillNLNewId')
        .mockImplementationOnce(() => 'proposeDecliValideProtoForActifSkillNewId')
        .mockImplementationOnce(() => 'valideDecliValideProtoForActifSkillNewId');
      const actifSkillData = {
        id: 'actifSkillId',
        status: Skill.STATUSES.ACTIF,
        tubeId: 'tubeId',
        version: 2,
        level: 1,
        name: '@baseTube1',
        competenceId: 'someCompetenceId',
      };
      const actifSkill = airtableBuilder.factory.buildSkill(actifSkillData);
      databaseBuilder.factory.buildTranslation({
        key: 'skill.actifSkillId.hint',
        locale: 'fr',
        value: 'hint fr',
      });
      await databaseBuilder.commit();
      const archiveSkill = airtableBuilder.factory.buildSkill({
        id: 'archiveSkillId',
        status: Skill.STATUSES.ARCHIVE,
      });
      const perimeSkill = airtableBuilder.factory.buildSkill({
        id: 'perimeSkillId',
        status: Skill.STATUSES.PERIME,
      });
      nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .query(true)
        .times(2)
        .reply(200, { records: [actifSkill, archiveSkill, perimeSkill] });

      skillRepository.listByTubeId.mockImplementation(() => [
        domainBuilder.buildSkill({ level: 1, version: 1 }),
        domainBuilder.buildSkill({ level: 1, version: 2 }),
      ]);
      const valideProtoAttachment = domainBuilder.buildAttachment({
        id: 'valideProtoAttachmentId',
        url: 'url attach valideProto',
        type: 'type attach valideProto',
        challengeId: 'valideProtoForActifSkillId',
        localizedChallengeId: 'valideProtoForActifSkillId',
      });
      const valideProtoAttachmentNL = domainBuilder.buildAttachment({
        id: 'valideProtoAttachmentNLId',
        url: 'url attach valideProtoNL',
        type: 'type attach valideProtoNL',
        challengeId: 'valideProtoForActifSkillId',
        localizedChallengeId: 'valideProtoForActifSkillLocNLId',
      });
      const proposeDecliAttachment = domainBuilder.buildAttachment({
        id: 'proposeDecliAttachmentId',
        url: 'url attach proposeDecli',
        type: 'type attach proposeDecli',
        challengeId: 'proposeDecliValideProtoForActifSkillId',
        localizedChallengeId: 'proposeDecliValideProtoForActifSkillId',
      });
      const valideDecliAttachment = domainBuilder.buildAttachment({
        id: 'valideDecliAttachmentId',
        url: 'url attach valideDecli',
        type: 'type attach valideDecli',
        challengeId: 'valideDecliValideProtoForActifSkillId',
        localizedChallengeId: 'valideDecliValideProtoForActifSkillId',
      });
      attachmentRepository.listByChallengeIds.mockImplementation(() => [
        valideProtoAttachment,
        proposeDecliAttachment,
        valideDecliAttachment,
        valideProtoAttachmentNL,
      ]);

      const valideProtoForActifSkill = domainBuilder.buildChallenge({
        id: 'valideProtoForActifSkillId',
        status: Challenge.STATUSES.VALIDE,
        skillId: 'actifSkillId',
        genealogy: 'Prototype 1',
        version: 4,
        focusable: false,
        locales: ['fr', 'nl'],
        translations: { fr: { instruction: 'instruction valideProto fr' }, nl: { instruction: 'instruction valideProto nl' } },
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({
            id: 'valideProtoForActifSkillId',
            challengeId: 'valideProtoForActifSkillId',
            embedUrl: 'valideProto embedUrl',
            fileIds: [valideProtoAttachment.id],
            locale: 'fr',
            status: null,
            geography: 'France',
            urlsToConsult: ['http://valideProto.com'],
          }),
          domainBuilder.buildLocalizedChallenge({
            id: 'valideProtoForActifSkillLocNLId',
            challengeId: 'valideProtoForActifSkillId',
            embedUrl: 'valideProto NL embedUrl',
            fileIds: [valideProtoAttachmentNL.id],
            locale: 'nl',
            status: Challenge.STATUSES.VALIDE,
            geography: 'Pays-Bas',
            urlsToConsult: ['http://valideProtoNL.com'],
          }),
        ],
      });
      const proposeDecliValideProtoForActifSkill = domainBuilder.buildChallenge({
        id: 'proposeDecliValideProtoForActifSkillId',
        status: Challenge.STATUSES.PROPOSE,
        skillId: 'actifSkillId',
        genealogy: 'Décliné 1',
        version: 4,
        alternativeVersion: 3,
        focusable: false,
        locales: ['fr'],
        translations: { fr: { instruction: 'instruction proposeDecli fr' } },
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({
            id: 'proposeDecliValideProtoForActifSkillId',
            challengeId: 'proposeDecliValideProtoForActifSkillId',
            embedUrl: 'proposeDecli embedUrl',
            fileIds: [proposeDecliAttachment.id],
            locale: 'fr',
            status: null,
            geography: 'Espagne',
            urlsToConsult: ['http://proposeDecli.com'],
          }),
        ],
      });
      const valideDecliValideProtoForActifSkill = domainBuilder.buildChallenge({
        id: 'valideDecliValideProtoForActifSkillId',
        status: Challenge.STATUSES.VALIDE,
        skillId: 'actifSkillId',
        genealogy: 'Décliné 1',
        version: 4,
        alternativeVersion: 4,
        focusable: false,
        locales: ['fr'],
        translations: { fr: { instruction: 'instruction valideDecli fr' } },
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({
            id: 'valideDecliValideProtoForActifSkillId',
            challengeId: 'valideDecliValideProtoForActifSkillId',
            embedUrl: 'valideDecli embedUrl',
            fileIds: [valideDecliAttachment.id],
            locale: 'fr',
            status: null,
            geography: 'Espagne',
            urlsToConsult: ['http://valideDecli.com'],
          }),
        ],
      });
      const challenges = [
        domainBuilder.buildChallenge({
          id: 'proposeChallengeForArchiveSkillId',
          status: Challenge.STATUSES.PROPOSE,
          skillId: 'archiveSkillId',
          genealogy: 'Prototype 1',
          focusable: false,
        }),
        domainBuilder.buildChallenge({
          id: 'proposeChallengeForPerimeSkillId',
          status: Challenge.STATUSES.PROPOSE,
          skillId: 'perimeSkillId',
          genealogy: 'Prototype 1',
          focusable: false,
        }),
        // Proto périmé
        domainBuilder.buildChallenge({
          id: 'perimeProtoForActifSkillId',
          status: Challenge.STATUSES.PERIME,
          skillId: 'actifSkillId',
          version: 1,
          genealogy: 'Prototype 1',
          focusable: false,
        }),
        domainBuilder.buildChallenge({
          id: 'proposeDecliPerimeProtoForActifSkillId',
          status: Challenge.STATUSES.PROPOSE,
          skillId: 'actifSkillId',
          version: 1,
          alternativeVersion: 1,
          genealogy: 'Décliné 1',
          focusable: false,
        }),
        // Proto archivé
        domainBuilder.buildChallenge({
          id: 'archiveProtoForActifSkillId',
          status: Challenge.STATUSES.ARCHIVE,
          skillId: 'actifSkillId',
          version: 2,
          genealogy: 'Prototype 1',
          focusable: false,
        }),
        domainBuilder.buildChallenge({
          id: 'proposeDecliArchiveProtoForActifSkillId',
          status: Challenge.STATUSES.PROPOSE,
          skillId: 'actifSkillId',
          version: 2,
          alternativeVersion: 1,
          genealogy: 'Décliné 1',
          focusable: false,
        }),
        // Proto proposé
        domainBuilder.buildChallenge({
          id: 'proposeProtoForActifSkillId',
          status: Challenge.STATUSES.PROPOSE,
          skillId: 'actifSkillId',
          genealogy: 'Prototype 1',
          version: 3,
          focusable: false,
        }),
        domainBuilder.buildChallenge({
          id: 'proposeDecliProposeProtoForActifSkillId',
          status: Challenge.STATUSES.PROPOSE,
          skillId: 'actifSkillId',
          genealogy: 'Décliné 1',
          version: 3,
          alternativeVersion: 3,
          focusable: false,
        }),
        // Proto validé + décli de tous les statuts possibles
        valideProtoForActifSkill,
        domainBuilder.buildChallenge({
          id: 'perimeDecliValideProtoForActifSkillId',
          status: Challenge.STATUSES.PERIME,
          skillId: 'actifSkillId',
          genealogy: 'Décliné 1',
          version: 4,
          alternativeVersion: 1,
          focusable: false,
        }),
        domainBuilder.buildChallenge({
          id: 'archiveDecliValideProtoForActifSkillId',
          status: Challenge.STATUSES.ARCHIVE,
          skillId: 'actifSkillId',
          genealogy: 'Décliné 1',
          version: 4,
          alternativeVersion: 2,
          focusable: false,
        }),
        proposeDecliValideProtoForActifSkill,
        valideDecliValideProtoForActifSkill,
      ];

      vi.spyOn(challengeRepository, 'listBySkillId')
        .mockImplementation((skillId) => challenges.filter((challenge) => challenge.skillId === skillId));

      // when
      await moveToFocus({ airtableClient, dryRun: false });

      // then
      expect(challengeRepository.createBatch).toHaveBeenCalledTimes(1);
      expect(challengeRepository.createBatch).toHaveBeenCalledWith([
        domainBuilder.buildChallenge({
          ...valideProtoForActifSkill,
          id: 'valideProtoForActifSkillNewId',
          airtableId: null,
          version: 1,
          alternativeVersion: null,
          status: Challenge.STATUSES.VALIDE,
          focusable: true,
          competenceId: actifSkillData.competenceId,
          skillId: 'skillNewId',
          files: [],
          skills: [],
          alpha: null,
          delta: null,
          archivedAt: null,
          createdAt: null,
          madeObsoleteAt: null,
          updatedAt: null,
          validatedAt: null,
          translations: { fr: { instruction: 'instruction valideProto fr' }, nl: { instruction: 'instruction valideProto nl' } },
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({
              ...valideProtoForActifSkill.localizedChallenges[0],
              status: null,
              id: 'valideProtoForActifSkillNewId',
              challengeId: 'valideProtoForActifSkillNewId',
              fileIds: [],
            }),
            domainBuilder.buildLocalizedChallenge({
              ...valideProtoForActifSkill.localizedChallenges[1],
              status: Challenge.STATUSES.VALIDE,
              id: 'valideProtoForActifSkillNLNewId',
              challengeId: 'valideProtoForActifSkillNewId',
              fileIds: [],
            }),
          ],
        }),
        domainBuilder.buildChallenge({
          ...proposeDecliValideProtoForActifSkill,
          id: 'proposeDecliValideProtoForActifSkillNewId',
          airtableId: null,
          version: 1,
          alternativeVersion: 1,
          status: Challenge.STATUSES.PROPOSE,
          focusable: true,
          competenceId: actifSkillData.competenceId,
          skillId: 'skillNewId',
          files: [],
          skills: [],
          alpha: null,
          delta: null,
          archivedAt: null,
          createdAt: null,
          madeObsoleteAt: null,
          updatedAt: null,
          validatedAt: null,
          translations: { fr: { instruction: 'instruction proposeDecli fr' } },
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({
              ...proposeDecliValideProtoForActifSkill.localizedChallenges[0],
              status: null,
              id: 'proposeDecliValideProtoForActifSkillNewId',
              challengeId: 'proposeDecliValideProtoForActifSkillNewId',
              fileIds: [],
            }),
          ],
        }),
        domainBuilder.buildChallenge({
          ...valideDecliValideProtoForActifSkill,
          id: 'valideDecliValideProtoForActifSkillNewId',
          airtableId: null,
          version: 1,
          alternativeVersion: 2,
          status: Challenge.STATUSES.VALIDE,
          focusable: true,
          competenceId: actifSkillData.competenceId,
          skillId: 'skillNewId',
          files: [],
          skills: [],
          alpha: null,
          delta: null,
          archivedAt: null,
          createdAt: null,
          madeObsoleteAt: null,
          updatedAt: null,
          validatedAt: null,
          translations: { fr: { instruction: 'instruction valideDecli fr' } },
          localizedChallenges: [
            domainBuilder.buildLocalizedChallenge({
              ...valideDecliValideProtoForActifSkill.localizedChallenges[0],
              status: null,
              id: 'valideDecliValideProtoForActifSkillNewId',
              challengeId: 'valideDecliValideProtoForActifSkillNewId',
              fileIds: [],
            }),
          ],
        }),
      ]);
      expect(attachmentRepository.createBatch).toHaveBeenCalledTimes(1);
      expect(attachmentRepository.createBatch).toHaveBeenCalledWith([
        domainBuilder.buildAttachment({
          id: null,
          url: valideProtoAttachment.url,
          type: valideProtoAttachment.type,
          challengeId: 'valideProtoForActifSkillNewId',
          localizedChallengeId: 'valideProtoForActifSkillNewId',
        }),
        domainBuilder.buildAttachment({
          id: null,
          url: valideProtoAttachmentNL.url,
          type: valideProtoAttachmentNL.type,
          challengeId: 'valideProtoForActifSkillNewId',
          localizedChallengeId: 'valideProtoForActifSkillNLNewId',
        }),
        domainBuilder.buildAttachment({
          id: null,
          url: proposeDecliAttachment.url,
          type: proposeDecliAttachment.type,
          challengeId: 'proposeDecliValideProtoForActifSkillNewId',
          localizedChallengeId: 'proposeDecliValideProtoForActifSkillNewId',
        }),
        domainBuilder.buildAttachment({
          id: null,
          url: valideDecliAttachment.url,
          type: valideDecliAttachment.type,
          challengeId: 'valideDecliValideProtoForActifSkillNewId',
          localizedChallengeId: 'valideDecliValideProtoForActifSkillNewId',
        }),
      ]);
    });

    it('should archive cloned skill and its challenges', async () => {
      // given
      idGenerator.generateNewId.mockImplementation(() => 'someNewId');
      const actifSkillData = {
        id: 'actifSkillId',
        description: 'la description de mon acquis',
        hintStatus: 'some hint status',
        status: Skill.STATUSES.ACTIF,
        tubeId: 'tubeId',
        competenceId: 'competenceId',
        version: 2,
        level: 1,
        name: '@baseTube1',
        tutorialIds: ['monTuto1Id'],
        learningMoreTutorialIds: ['monTuto2Id'],
        internationalisation: 'France',
        pixValue: 1,
        hint_i18n: { fr: 'hint fr', en: null },
      };
      const actifSkill = airtableBuilder.factory.buildSkill(actifSkillData);
      databaseBuilder.factory.buildTranslation({
        key: 'skill.actifSkillId.hint',
        locale: 'fr',
        value: 'hint fr',
      });
      await databaseBuilder.commit();
      nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .query(true)
        .times(2)
        .reply(200, { records: [actifSkill] });

      skillRepository.listByTubeId.mockImplementation(() => []);
      attachmentRepository.listByChallengeIds.mockImplementation(() => []);

      const valideForActifSkillData = {
        id: 'valideForActifSkillId',
        status: Challenge.STATUSES.VALIDE,
        skillId: 'actifSkillId',
        locales: ['fr', 'nl'],
        archivedAt: null,
        madeObsoleteAt: null,
        translations: { fr: { instruction: 'instruction valide fr' }, nl: { instruction: 'instruction valide nl' } },
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({
            id: 'valideForActifSkillId',
            challengeId: 'valideForActifSkillId',
            embedUrl: 'valide embedUrl',
            fileIds: [],
            locale: 'fr',
            status: null,
            geography: 'France',
            urlsToConsult: ['http://valide.com'],
          }),
          domainBuilder.buildLocalizedChallenge({
            id: 'proposeNLValideForActifSkillId',
            challengeId: 'valideForActifSkillId',
            embedUrl: 'propose NL embedUrl',
            fileIds: [],
            locale: 'nl',
            status: Challenge.STATUSES.PROPOSE,
            geography: 'Pays-Bas',
            urlsToConsult: ['http://proposeNL.com'],
          }),
        ],
      };
      const valideForActifSkill = domainBuilder.buildChallenge(valideForActifSkillData);
      const proposeForActifSkillData = {
        id: 'proposeForActifSkillId',
        status: Challenge.STATUSES.PROPOSE,
        skillId: 'actifSkillId',
        locales: ['fr'],
        archivedAt: null,
        madeObsoleteAt: null,
        translations: { fr: { instruction: 'instruction propose fr' } },
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({
            id: 'proposeForActifSkillId',
            challengeId: 'proposeForActifSkillId',
            embedUrl: 'propose embedUrl',
            fileIds: [],
            locale: 'fr',
            status: null,
            geography: 'France',
            urlsToConsult: ['http://propose.com'],
          }),
        ],
      };
      const proposeForActifSkill = domainBuilder.buildChallenge(proposeForActifSkillData);
      const archiveForActifSkillData = {
        id: 'archiveForActifSkillId',
        status: Challenge.STATUSES.ARCHIVE,
        archivedAt: new Date('2020-01-01'),
        madeObsoleteAt: null,
        skillId: 'actifSkillId',
        locales: ['fr'],
        translations: { fr: { instruction: 'instruction propose fr' } },
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({
            id: 'archiveForActifSkillId',
            challengeId: 'archiveForActifSkillId',
            embedUrl: 'archive embedUrl',
            fileIds: [],
            locale: 'fr',
            status: null,
            geography: 'France',
            urlsToConsult: ['http://archive.com'],
          }),
        ],
      };
      const archiveForActifSkill = domainBuilder.buildChallenge(archiveForActifSkillData);
      const challenges = [valideForActifSkill, proposeForActifSkill, archiveForActifSkill];

      vi.spyOn(challengeRepository, 'listBySkillId')
        .mockImplementation((skillId) => challenges.filter((challenge) => challenge.skillId === skillId));

      // when
      await moveToFocus({ airtableClient, dryRun: false });

      // then
      expect(skillRepository.update).toHaveBeenCalledTimes(1);
      expect(skillRepository.update).toHaveBeenCalledWith(domainBuilder.buildSkill({
        ...actifSkillData,
        status: Skill.STATUSES.ARCHIVE,
      }));
      expect(challengeRepository.updateBatch).toHaveBeenCalledTimes(1);
      expect(challengeRepository.updateBatch).toHaveBeenCalledWith([
        domainBuilder.buildChallenge({
          ...valideForActifSkillData,
          status: Challenge.STATUSES.ARCHIVE,
          archivedAt: archivedAtDate,
          madeObsoleteAt: null,
        }),
        domainBuilder.buildChallenge({
          ...proposeForActifSkillData,
          status: Challenge.STATUSES.PERIME,
          archivedAt: null,
          madeObsoleteAt: archivedAtDate,
        }),
        domainBuilder.buildChallenge({
          ...archiveForActifSkillData,
          status: Challenge.STATUSES.ARCHIVE,
          archivedAt: archiveForActifSkillData.archivedAt,
          madeObsoleteAt: archiveForActifSkillData.madeObsoleteAt,
        }),
      ]);
    });
  });
});

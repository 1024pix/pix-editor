import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { airtableBuilder, domainBuilder, knex } from '../test-helper.js';
import nock from 'nock';
import { Challenge, Skill } from '../../lib/domain/models/index.js';
import * as script from '../../scripts/fix-cloned-attachments/index.js';
import {
  attachmentRepository,
  challengeRepository,
  skillRepository,
} from '../../lib/infrastructure/repositories/index.js';
import * as idGenerator from '../../lib/infrastructure/utils/id-generator.js';

describe('Script | Fix cloned attachments', function() {
  const obsoleteAt = new Date('2021-10-29T03:03:00Z');
  const myCurrentScriptId = '1718928123456';

  beforeEach(() => {
    nock('https://api.airtable.com')
      .get(/^\/v0\/airtableBaseValue\/translations\?.*/)
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .optionally()
      .reply(404);

    vi.spyOn(challengeRepository, 'listBySkillId');
    vi.spyOn(challengeRepository, 'update');
    vi.spyOn(challengeRepository, 'createBatch');
    vi.spyOn(challengeRepository, 'updateBatch');
    vi.spyOn(challengeRepository, 'getMany');
    vi.spyOn(skillRepository, 'create');
    vi.spyOn(skillRepository, 'update');
    vi.spyOn(idGenerator, 'generateNewId');
    vi.spyOn(attachmentRepository, 'listByLocalizedChallengeIds');
    vi.spyOn(attachmentRepository, 'createBatch');
    challengeRepository.update.mockImplementation(() => true);
    challengeRepository.createBatch.mockImplementation(() => true);
    challengeRepository.updateBatch.mockImplementation(() => true);
    attachmentRepository.createBatch.mockImplementation(() => true);
    vi.useFakeTimers();
    vi.setSystemTime(obsoleteAt);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    await knex('translations').truncate();
    await knex('focus_phrase').truncate();
    await knex('historic_focus').truncate();
  });

  it('should do nothing if there are no skills to fix with attachments or if skill is not included in specified script execution', async() => {
    // given
    const scriptExectIdToFix = '1711111111';
    await knex('historic_focus').insert([
      {
        persistantId: 'skillABC',
        scriptExectId: scriptExectIdToFix,
        dryRun: false,
        createdAt: new Date('2021-01-01')
      },
      {
        persistantId: 'skillDEF',
        scriptExectId: scriptExectIdToFix,
        dryRun: false,
      },
      {
        persistantId: 'skillGHI',
        scriptExectId: '17112222222',
        dryRun: false,
      },
    ]);
    await knex('focus_phrase').insert([
      {
        type: 'skill',
        persistantId : 'skillABC_clone',
        originPersistantId : 'skillABC',
        scriptExectId: scriptExectIdToFix,
      },
      {
        type: 'skill',
        persistantId : 'skillDEF_clone',
        originPersistantId : 'skillDEF',
        scriptExectId: scriptExectIdToFix,
      },
      {
        type: 'skill',
        persistantId : 'skillGHI_clone',
        originPersistantId : 'skillGHI',
        scriptExectId: '1766666666',
      },
    ]);
    const skillABC_data = {
      id: 'skillABC',
      description: 'la description de mon acquis',
      hintStatus: 'some hint status',
      status: Skill.STATUSES.ARCHIVE,
      tubeId: 'tubeId',
      competenceId: 'competenceId',
      version: 2,
      level: 1,
      name: '@baseTube1',
      tutorialIds: ['monTuto1Id'],
      learningMoreTutorialIds: ['monTuto2Id'],
      internationalisation: 'France',
    };
    const skillABC_clone_data = {
      ...skillABC_data,
      id: 'skillABC_clone',
    };
    const skillDEF_data = {
      id: 'skillDEF',
      status: Skill.STATUSES.EN_CONSTRUCTION,
    };
    const skillABC = airtableBuilder.factory.buildSkill(skillABC_data);
    const skillDEF = airtableBuilder.factory.buildSkill(skillDEF_data);
    const skillABC_clone = airtableBuilder.factory.buildSkill(skillABC_clone_data);
    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Acquis')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query(true)
      .times(2)
      .reply(200, { records: [skillABC, skillDEF, skillABC_clone] });
    attachmentRepository.listByLocalizedChallengeIds.mockImplementation(() => []);

    const archiveProtoForActifSkill = domainBuilder.buildChallenge({
      id: 'archiveProtoForActifSkill',
      status: Challenge.STATUSES.ARCHIVE,
      archivedAt: new Date('2020-01-01').toISOString(),
      skillId: 'skillABC',
      genealogy: 'Prototype 1',
      version: 4,
      focusable: false,
      locales: ['fr', 'nl'],
      translations: { fr: { instruction: 'instruction valideProto fr' }, nl: { instruction: 'instruction valideProto nl' } },
      localizedChallenges: [
        domainBuilder.buildLocalizedChallenge({
          id: 'valideProtoForSkillABC',
          challengeId: 'valideProtoForSkillABC',
          embedUrl: 'valideProto embedUrl',
          fileIds: [],
          locale: 'fr',
          status: null,
          geography: 'France',
          urlsToConsult: ['http://valideProto.com'],
        }),
        domainBuilder.buildLocalizedChallenge({
          id: 'valideProtoForActifSkillLocNLId',
          challengeId: 'valideProtoForSkillABC',
          embedUrl: 'valideProto NL embedUrl',
          fileIds: [],
          locale: 'nl',
          status: Challenge.STATUSES.VALIDE,
          geography: 'Pays-Bas',
          urlsToConsult: ['http://valideProtoNL.com'],
        }),
      ],
      files: [],
    });
    const challenges = [archiveProtoForActifSkill];

    vi.spyOn(challengeRepository, 'listBySkillId')
      .mockImplementation((skillId) => challenges.filter((challenge) => challenge.skillId === skillId));
    vi.spyOn(challengeRepository, 'getMany').mockResolvedValue([]);

    // when
    await script.fix({ dryRun: false, scriptExectIdToFix, scriptExectId: myCurrentScriptId });

    // then
    expect(challengeRepository.createBatch).toHaveBeenCalledTimes(0);
    expect(attachmentRepository.createBatch).toHaveBeenCalledTimes(0);
    const focus_phrase_records = await knex('focus_phrase').select('*').where({ scriptExectId: myCurrentScriptId }).orderBy(['type', 'persistantId']);
    expect(focus_phrase_records).toStrictEqual([]);
  });

  it('should clone challenges from origin skills and put them under cloned skill', async() => {
    // given
    const scriptExectIdToFix = '1718928111121';
    idGenerator.generateNewId
      .mockReturnValueOnce('valideProtoForActifSkillNewId')
      .mockReturnValueOnce('valideProtoForActifSkillNLNewId')
      .mockReturnValueOnce('valideDecliValideProtoForActifSkillNewId')
      .mockReturnValueOnce('proposeDecliValideProtoForActifSkillNewId');

    await knex('historic_focus').insert([
      {
        persistantId: 'skillABC',
        scriptExectId: scriptExectIdToFix,
        dryRun: false,
        createdAt: new Date('2024-01-01T10:00:00Z')
      },
    ]);
    await knex('focus_phrase').insert([
      {
        type: 'skill',
        persistantId : 'skillABC_clone',
        originPersistantId : 'skillABC',
        scriptExectId: scriptExectIdToFix,
      },
    ]);
    const skillABC_data = {
      id: 'skillABC',
      description: 'la description de mon acquis',
      hintStatus: 'some hint status',
      status: Skill.STATUSES.ARCHIVE,
      tubeId: 'tubeId',
      competenceId: 'competenceId',
      version: 2,
      level: 1,
      name: '@baseTube1',
      tutorialIds: ['monTuto1Id'],
      learningMoreTutorialIds: ['monTuto2Id'],
      internationalisation: 'France',
    };
    const skillABC_clone_data = {
      ...skillABC_data,
      id: 'skillABC_clone',
    };
    const skillABC = airtableBuilder.factory.buildSkill(skillABC_data);
    const skillABC_clone = airtableBuilder.factory.buildSkill(skillABC_clone_data);
    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Acquis')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query(true)
      .times(2)
      .reply(200, { records: [skillABC, skillABC_clone] });

    const archiveProtoAttachment = domainBuilder.buildAttachment({
      id: 'archiveProtoAttachmentId',
      url: 'url attach valideProto',
      type: 'type attach valideProto',
      size: 1,
      mimeType: 'mimeType1',
      filename: 'filename_valideproto',
      challengeId: 'archiveProtoForSkillABC',
      localizedChallengeId: 'archiveProtoForSkillABC',
    });
    const archiveProtoAttachmentNL = domainBuilder.buildAttachment({
      id: 'archiveProtoAttachmentNLId',
      url: 'url attach valideProtoNL',
      type: 'type attach valideProtoNL',
      size: 2,
      mimeType: 'mimeType2',
      filename: 'filename_valideprotoNL',
      challengeId: 'archiveProtoForSkillABC',
      localizedChallengeId: 'archiveProtoForActifSkillLocNLId',
    });

    attachmentRepository.listByLocalizedChallengeIds.mockImplementation(() => [
      archiveProtoAttachment,
      archiveProtoAttachmentNL,
    ]);

    const ArchiveProtoForActifSkill = domainBuilder.buildChallenge({
      id: 'archiveProtoForSkillABC',
      status: Challenge.STATUSES.ARCHIVE,
      skillId: 'skillABC',
      genealogy: 'Prototype 1',
      version: 4,
      focusable: false,
      locales: ['fr', 'nl'],
      translations: { fr: { instruction: 'instruction valideProto fr' }, nl: { instruction: 'instruction valideProto nl' } },
      archivedAt: '2024-01-01T09:58:00Z',
      localizedChallenges: [
        domainBuilder.buildLocalizedChallenge({
          id: 'archiveProtoForSkillABC',
          challengeId: 'archiveProtoForSkillABC',
          embedUrl: 'archiveProto embedUrl',
          fileIds: [archiveProtoAttachment.id],
          locale: 'fr',
          status: null,
          geography: 'France',
          urlsToConsult: ['http://archiveProto.com'],
        }),
        domainBuilder.buildLocalizedChallenge({
          id: 'archiveProtoForActifSkillLocNLId',
          challengeId: 'archiveProtoForSkillABC',
          embedUrl: 'archiveProto NL embedUrl',
          fileIds: [archiveProtoAttachmentNL.id],
          locale: 'nl',
          status: Challenge.STATUSES.VALIDE,
          geography: 'Pays-Bas',
          urlsToConsult: ['http://archiveProtoNL.com'],
        }),
      ],
    });

    const archiveDecliForActifSkill = domainBuilder.buildChallenge({
      id: 'archiveDecliForSkillABC',
      status: Challenge.STATUSES.ARCHIVE,
      skillId: 'skillABC',
      genealogy: 'Décliné 1',
      version: 4,
      focusable: false,
      locales: ['fr'],
      translations: { fr: { instruction: 'instruction valideDecli fr' } },
      archivedAt: '2024-01-01T10:02:00Z',
      localizedChallenges: [
        domainBuilder.buildLocalizedChallenge({
          id: 'archiveDecliForSkillABC',
          challengeId: 'archiveDecliForSkillABC',
          embedUrl: 'archiveDecli embedUrl',
          fileIds: [],
          locale: 'fr',
          status: null,
          geography: 'France',
          urlsToConsult: ['http://archiveDecli.com'],
        })
      ],
    });

    const obsoleteDecliForActifSkill = domainBuilder.buildChallenge({
      id: 'obsoleteDecliForSkillABC',
      status: Challenge.STATUSES.PERIME,
      skillId: 'skillABC',
      genealogy: 'Décliné 1',
      version: 4,
      focusable: false,
      locales: ['fr'],
      translations: { fr: { instruction: 'instruction obsoleteDecli fr' } },
      madeObsoleteAt:'2024-01-01T10:02:00Z',
      localizedChallenges: [
        domainBuilder.buildLocalizedChallenge({
          id: 'obsoleteDecliForSkillABC',
          challengeId: 'obsoleteDecliForSkillABC',
          embedUrl: 'obsoleteDecli embedUrl',
          fileIds: [],
          locale: 'fr',
          status: null,
          geography: 'France',
          urlsToConsult: ['http://obsoleteDecli.com'],
        })
      ],
    });

    const challenges = [
      ArchiveProtoForActifSkill,
      archiveDecliForActifSkill,
      obsoleteDecliForActifSkill,
      domainBuilder.buildChallenge({
        id: 'wrongArchiveProtoForSkillABC1',
        status: Challenge.STATUSES.ARCHIVE,
        skillId: 'skillABC',
        genealogy: 'Prototype 1',
        version: 3,
        locales: [],
        translations: {},
        archivedAt: '2023-11-01T00:58:00Z',
      }),
      domainBuilder.buildChallenge({
        id: 'wrongArchiveProtoForSkillABC2',
        status: Challenge.STATUSES.ARCHIVE,
        skillId: 'skillABC',
        genealogy: 'Prototype 1',
        version: 2,
        locales: [],
        translations: {},
        archivedAt: '2024-01-01T10:10:00Z',
      }),
      domainBuilder.buildChallenge({
        id: 'wrongArchiveProtoForSkillABC3',
        status: Challenge.STATUSES.ARCHIVE,
        skillId: 'skillABC',
        genealogy: 'Prototype 1',
        version: 1,
        locales: [],
        translations: {},
        archivedAt: '2024-01-01T09:50:00Z',
      }),
      domainBuilder.buildChallenge({
        id: 'wrongArchiveDecliForSkillABC4',
        status: Challenge.STATUSES.ARCHIVE,
        skillId: 'skillABC',
        genealogy: 'Décliné 1',
        version: 4,
        locales: [],
        translations: {},
        archivedAt: '2023-01-01T09:50:00Z',
      }),
      domainBuilder.buildChallenge({
        id: 'wrongObsoleteDecliForSkillABC5',
        status: Challenge.STATUSES.PERIME,
        skillId: 'skillABC',
        genealogy: 'Décliné 1',
        version: 4,
        locales: [],
        translations: {},
        madeObsoleteAt: '2024-01-01T09:50:00Z',
      }),
    ];

    vi.spyOn(challengeRepository, 'listBySkillId')
      .mockResolvedValue(challenges);
    vi.spyOn(challengeRepository, 'getMany').mockResolvedValue([]);

    // when
    await script.fix({ dryRun: false, scriptExectIdToFix, scriptExectId: myCurrentScriptId });

    // then
    expect(challengeRepository.createBatch).toHaveBeenCalledTimes(1);
    expect(challengeRepository.createBatch).toHaveBeenCalledWith([
      domainBuilder.buildChallenge({
        ...ArchiveProtoForActifSkill,
        id: 'valideProtoForActifSkillNewId',
        airtableId: null,
        version: 2,
        status: Challenge.STATUSES.VALIDE,
        focusable: true,
        competenceId: skillABC_data.competenceId,
        skillId: skillABC_clone_data.id,
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
            ...ArchiveProtoForActifSkill.localizedChallenges[0],
            status: null,
            id: 'valideProtoForActifSkillNewId',
            challengeId: 'valideProtoForActifSkillNewId',
            fileIds: [],
          }),
          domainBuilder.buildLocalizedChallenge({
            ...ArchiveProtoForActifSkill.localizedChallenges[1],
            status: Challenge.STATUSES.VALIDE,
            id: 'valideProtoForActifSkillNLNewId',
            challengeId: 'valideProtoForActifSkillNewId',
            fileIds: [],
          }),
        ],
      }),
      domainBuilder.buildChallenge({
        ...archiveDecliForActifSkill,
        id: 'valideDecliValideProtoForActifSkillNewId',
        airtableId: null,
        version: 2,
        status: Challenge.STATUSES.VALIDE,
        focusable: true,
        competenceId: skillABC_data.competenceId,
        skillId: skillABC_clone_data.id,
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
            ...archiveDecliForActifSkill.localizedChallenges[0],
            status: null,
            id: 'valideDecliValideProtoForActifSkillNewId',
            challengeId: 'valideDecliValideProtoForActifSkillNewId',
            fileIds: [],
          }),
        ],
      }),
      domainBuilder.buildChallenge({
        ...obsoleteDecliForActifSkill,
        id: 'proposeDecliValideProtoForActifSkillNewId',
        airtableId: null,
        version: 2,
        status: Challenge.STATUSES.PROPOSE,
        focusable: true,
        competenceId: skillABC_data.competenceId,
        skillId: skillABC_clone_data.id,
        files: [],
        skills: [],
        alpha: null,
        delta: null,
        archivedAt: null,
        createdAt: null,
        madeObsoleteAt: null,
        updatedAt: null,
        validatedAt: null,
        translations: { fr: { instruction: 'instruction obsoleteDecli fr' } },
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({
            ...obsoleteDecliForActifSkill.localizedChallenges[0],
            status: null,
            id: 'proposeDecliValideProtoForActifSkillNewId',
            challengeId: 'proposeDecliValideProtoForActifSkillNewId',
            fileIds: [],
          }),
        ],
      }),
    ]);
    expect(attachmentRepository.createBatch).toHaveBeenCalledTimes(1);
    expect(attachmentRepository.createBatch).toHaveBeenCalledWith([
      domainBuilder.buildAttachment({
        id: null,
        url: archiveProtoAttachment.url,
        type: archiveProtoAttachment.type,
        size: archiveProtoAttachment.size,
        mimeType: archiveProtoAttachment.mimeType,
        filename: archiveProtoAttachment.filename,
        challengeId: 'valideProtoForActifSkillNewId',
        localizedChallengeId: 'valideProtoForActifSkillNewId',
      }),
      domainBuilder.buildAttachment({
        id: null,
        url: archiveProtoAttachmentNL.url,
        type: archiveProtoAttachmentNL.type,
        size: archiveProtoAttachmentNL.size,
        mimeType: archiveProtoAttachmentNL.mimeType,
        filename: archiveProtoAttachmentNL.filename,
        challengeId: 'valideProtoForActifSkillNewId',
        localizedChallengeId: 'valideProtoForActifSkillNLNewId',
      }),
    ]);
    const focus_phrase_records = await knex('focus_phrase').select('*').where({ scriptExectId: myCurrentScriptId }).orderBy(['type', 'persistantId']);
    expect(focus_phrase_records).toStrictEqual([
      {
        id: expect.any(Number),
        persistantId: 'proposeDecliValideProtoForActifSkillNewId',
        originPersistantId: 'obsoleteDecliForSkillABC',
        type: 'challenge',
        createdAt: expect.anything(),
        scriptExectId: expect.anything(),
      },
      {
        id: expect.any(Number),
        persistantId: 'valideDecliValideProtoForActifSkillNewId',
        originPersistantId: 'archiveDecliForSkillABC',
        type: 'challenge',
        createdAt: expect.anything(),
        scriptExectId: expect.anything(),
      },
      {
        id: expect.any(Number),
        persistantId: 'valideProtoForActifSkillNewId',
        originPersistantId: 'archiveProtoForSkillABC',
        type: 'challenge',
        createdAt: expect.anything(),
        scriptExectId: expect.anything(),
      },
    ]);
  });

  it('should obsolete challenges of cloned skill', async() => {
    // given
    const scriptExectIdToFix = '1718928111121';
    await knex('historic_focus').insert([
      {
        persistantId: 'skillABC',
        scriptExectId: scriptExectIdToFix,
        dryRun: false,
        createdAt: new Date('2020-01-01'),
      },
    ]);
    await knex('focus_phrase').insert([
      {
        type: 'skill',
        persistantId : 'skillABC_clone',
        originPersistantId : 'skillABC',
        scriptExectId: scriptExectIdToFix,
      },
      {
        type: 'challenge',
        persistantId: 'challengeToPerime1',
        originPersistantId : 'challengeOrigine1',
        scriptExectId: scriptExectIdToFix,
      },
      {
        type: 'challenge',
        persistantId: 'challengeToPerime2',
        originPersistantId : 'challengeOrigine2',
        scriptExectId: scriptExectIdToFix,
      },
      {
        type: 'challenge',
        persistantId: 'ignoreMe',
        originPersistantId : 'osef',
        scriptExectId: '171892811487',
      },
    ]);
    idGenerator.generateNewId
      .mockReturnValueOnce('valideProtoForActifSkillNewId')
      .mockReturnValueOnce('valideProtoForActifSkillNLNewId');
    const skillABC_data = {
      id: 'skillABC',
      description: 'la description de mon acquis',
      hintStatus: 'some hint status',
      status: Skill.STATUSES.ARCHIVE,
      tubeId: 'tubeId',
      competenceId: 'competenceId',
      version: 2,
      level: 1,
      name: '@baseTube1',
      tutorialIds: ['monTuto1Id'],
      learningMoreTutorialIds: ['monTuto2Id'],
      internationalisation: 'France',
    };
    const skillABC_clone_data = {
      ...skillABC_data,
      id: 'skillABC_clone',
    };
    const skillABC = airtableBuilder.factory.buildSkill(skillABC_data);
    const skillABC_clone = airtableBuilder.factory.buildSkill(skillABC_clone_data);
    nock('https://api.airtable.com')
      .get('/v0/airtableBaseValue/Acquis')
      .matchHeader('authorization', 'Bearer airtableApiKeyValue')
      .query(true)
      .times(2)
      .reply(200, { records: [skillABC, skillABC_clone] });
    attachmentRepository.listByLocalizedChallengeIds.mockImplementation(() => []);

    const archiveProtoForActifSkill = domainBuilder.buildChallenge({
      id: 'archiveProtoForSkillABC',
      status: Challenge.STATUSES.ARCHIVE,
      skillId: 'skillABC',
      genealogy: 'Prototype 1',
      version: 4,
      focusable: false,
      locales: ['fr'],
      archivedAt: new Date('2020-01-01').toISOString(),
      translations: { fr: { instruction: 'instruction archiveProto fr' } },
      localizedChallenges: [
        domainBuilder.buildLocalizedChallenge({
          id: 'archiveProtoForSkillABC',
          challengeId: 'archiveProtoForSkillABC',
          embedUrl: 'archiveProto embedUrl',
          fileIds: [],
          locale: 'fr',
          status: null,
          geography: 'France',
          urlsToConsult: ['http://archiveProto.com'],
        }),
      ],
    });

    const challengeToPerime1_data = {
      id: 'challengeToPerime1',
      status: Challenge.STATUSES.VALIDE,
      skillId: 'osefId',
      locales: ['fr'],
      archivedAt: null,
      madeObsoleteAt: null,
      translations: { fr: { instruction: 'instruction valide fr' } },
      localizedChallenges: [
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeToPerime1Id',
          challengeId: 'challengeToPerime1Id',
          embedUrl: 'valide embedUrl',
          fileIds: [],
          locale: 'fr',
          status: null,
          geography: 'France',
          urlsToConsult: ['http://valide.com'],
        }),
      ],
    };
    const challengeToPerime2_data = {
      id: 'challengeToPerime2',
      status: Challenge.STATUSES.PROPOSE,
      skillId: 'osefId',
      locales: ['fr'],
      archivedAt: null,
      madeObsoleteAt: null,
      translations: { fr: { instruction: 'instruction valide fr' } },
      localizedChallenges: [
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeToPerime2Id',
          challengeId: 'challengeToPerime2Id',
          embedUrl: 'propose embedUrl',
          fileIds: [],
          locale: 'fr',
          status: null,
          geography: 'France',
          urlsToConsult: ['http://propose.com'],
        }),
      ],
    };
    const challengeToPerime1 = domainBuilder.buildChallenge(challengeToPerime1_data);
    const challengeToPerime2 = domainBuilder.buildChallenge(challengeToPerime2_data);
    const challenges = [archiveProtoForActifSkill, challengeToPerime1];

    vi.spyOn(challengeRepository, 'listBySkillId')
      .mockImplementation((skillId) => challenges.filter((challenge) => challenge.skillId === skillId));
    vi.spyOn(challengeRepository, 'getMany')
      .mockResolvedValue([challengeToPerime1, challengeToPerime2]);

    // when
    await script.fix({ dryRun: false, scriptExectIdToFix, scriptExectId: myCurrentScriptId });

    // then
    expect(challengeRepository.updateBatch).toHaveBeenCalledTimes(1);
    expect(challengeRepository.updateBatch).toHaveBeenCalledWith([
      domainBuilder.buildChallenge({
        ...challengeToPerime1_data,
        status: Challenge.STATUSES.PERIME,
        madeObsoleteAt: obsoleteAt.toISOString(),
      }),
      domainBuilder.buildChallenge({
        ...challengeToPerime2_data,
        status: Challenge.STATUSES.PERIME,
        madeObsoleteAt: obsoleteAt.toISOString(),
      }),
    ]);
  });

  describe('historic line', () => {
    it('clone not found', async() => {
      // given
      const scriptExectIdToFix = '1718928111121';
      await knex('historic_focus').insert([
        {
          persistantId: 'skillABC',
          scriptExectId: scriptExectIdToFix,
          dryRun: false,
        },
      ]);
      await knex('focus_phrase').insert([
        {
          type: 'skill',
          persistantId : 'skillDEF_clone',
          originPersistantId : 'skillDEF',
          scriptExectId: scriptExectIdToFix,
        },
      ]);
      idGenerator.generateNewId
        .mockReturnValueOnce('valideProtoForActifSkillNewId');
      const skillABC_data = {
        id: 'skillABC',
        description: 'la description de mon acquis',
        hintStatus: 'some hint status',
        status: Skill.STATUSES.ARCHIVE,
        tubeId: 'tubeId',
        competenceId: 'competenceId',
        version: 2,
        level: 1,
        name: '@baseTube1',
        tutorialIds: ['monTuto1Id'],
        learningMoreTutorialIds: ['monTuto2Id'],
        internationalisation: 'France',
      };
      const skillDEF_clone_data = {
        ...skillABC_data,
        id: 'skillDEF_clone',
        name: 'pas le meme',
      };
      const skillABC = airtableBuilder.factory.buildSkill(skillABC_data);
      const skillDEF_clone = airtableBuilder.factory.buildSkill(skillDEF_clone_data);
      nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .query(true)
        .times(2)
        .reply(200, { records: [skillABC, skillDEF_clone] });
      attachmentRepository.listByLocalizedChallengeIds.mockImplementation(() => []);

      vi.spyOn(challengeRepository, 'listBySkillId').mockResolvedValue([]);
      vi.spyOn(challengeRepository, 'getMany').mockResolvedValue([]);

      // when
      await expect(() => script.fix({ dryRun: false, scriptExectIdToFix, scriptExectId: myCurrentScriptId })).rejects.toThrowError('clone non trouvé');
      const historic_focus = await knex('historic_focus').select('*').where({ scriptExectId: myCurrentScriptId });
      expect(historic_focus).toStrictEqual([
        {
          id: expect.any(Number),
          persistantId: skillABC_data.id,
          errorStr: expect.any(String),
          details: `RAS Erreur lors du rematching acquis origine/cloné. Nom de l'acquis ${skillABC_data.name}.`,
          createdAt: expect.anything(),
          dryRun: false,
          scriptExectId: expect.anything(),
        },
      ]);
    });

    it('reading in airtable fails', async() => {
      // given
      const scriptExectIdToFix = '1718928111121';
      await knex('historic_focus').insert([
        {
          persistantId: 'skillABC',
          scriptExectId: scriptExectIdToFix,
          dryRun: false,
          createdAt: new Date('2020-01-01'),
        },
      ]);
      await knex('focus_phrase').insert([
        {
          type: 'skill',
          persistantId : 'skillABC_clone',
          originPersistantId : 'skillABC',
          scriptExectId: scriptExectIdToFix,
        },
      ]);
      idGenerator.generateNewId
        .mockReturnValueOnce('archiveProtoForActifSkillNewId');
      const skillABC_data = {
        id: 'skillABC',
        description: 'la description de mon acquis',
        hintStatus: 'some hint status',
        status: Skill.STATUSES.ARCHIVE,
        tubeId: 'tubeId',
        competenceId: 'competenceId',
        version: 2,
        level: 1,
        name: '@baseTube1',
        tutorialIds: ['monTuto1Id'],
        learningMoreTutorialIds: ['monTuto2Id'],
        internationalisation: 'France',
      };
      const skillABC_clone_data = {
        ...skillABC_data,
        id: 'skillABC_clone',
      };
      const skillABC = airtableBuilder.factory.buildSkill(skillABC_data);
      const skillABC_clone = airtableBuilder.factory.buildSkill(skillABC_clone_data);
      nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .query(true)
        .times(2)
        .reply(200, { records: [skillABC, skillABC_clone] });
      const archiveProtoAttachment = domainBuilder.buildAttachment({
        id: 'archiveProtoAttachmentId',
        url: 'url attach archiveProto',
        type: 'type attach archiveProto',
        size: 1,
        mimeType: 'mimeType1',
        filename: 'filename_archiveproto',
        challengeId: 'archiveProtoForSkillABC',
        localizedChallengeId: 'archiveProtoForSkillABC',
      });
      attachmentRepository.listByLocalizedChallengeIds.mockImplementation(() => {
        throw new Error('ERREUR attachmentRepository.listByLocalizedChallengeIds');
      });

      const archiveProtoForActifSkill = domainBuilder.buildChallenge({
        id: 'archiveProtoForSkillABC',
        status: Challenge.STATUSES.ARCHIVE,
        skillId: 'skillABC',
        genealogy: 'Prototype 1',
        version: 4,
        focusable: false,
        locales: ['fr'],
        archivedAt: new Date('2020-01-01').toISOString(),
        translations: { fr: { instruction: 'instruction archiveProto fr' } },
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({
            id: 'archiveProtoForSkillABC',
            challengeId: 'archiveProtoForSkillABC',
            embedUrl: 'archiveProto embedUrl',
            fileIds: [archiveProtoAttachment.id],
            locale: 'fr',
            status: null,
            geography: 'France',
            urlsToConsult: ['http://archiveProto.com'],
          }),
        ],
      });
      const challenges = [archiveProtoForActifSkill];

      vi.spyOn(challengeRepository, 'listBySkillId')
        .mockImplementation((skillId) => challenges.filter((challenge) => challenge.skillId === skillId));
      vi.spyOn(challengeRepository, 'getMany').mockResolvedValue([]);

      // when
      await expect(() => script.fix({ dryRun: false, scriptExectIdToFix, scriptExectId: myCurrentScriptId })).rejects.toThrowError('ERREUR attachmentRepository.listByLocalizedChallengeIds');
      const historic_focus = await knex('historic_focus').select('*').where({ scriptExectId: myCurrentScriptId });
      expect(historic_focus).toStrictEqual([
        {
          id: expect.any(Number),
          persistantId: skillABC_data.id,
          errorStr: expect.any(String),
          details: 'RAS Erreur lors d\'une lecture sur Airtable. Rien à nettoyer. ID Clone : skillABC_clone',
          createdAt: expect.anything(),
          dryRun: false,
          scriptExectId: expect.anything(),
        },
      ]);
    });

    it('challenge creation fails', async() => {
      // given
      const scriptExectIdToFix = '1718928111121';
      await knex('historic_focus').insert([
        {
          persistantId: 'skillABC',
          scriptExectId: scriptExectIdToFix,
          dryRun: false,
          createdAt: new Date('2020-01-01'),
        },
      ]);
      await knex('focus_phrase').insert([
        {
          type: 'skill',
          persistantId : 'skillABC_clone',
          originPersistantId : 'skillABC',
          scriptExectId: scriptExectIdToFix,
        },
      ]);
      idGenerator.generateNewId
        .mockReturnValueOnce('valideProtoForActifSkillNewId');
      const skillABC_data = {
        id: 'skillABC',
        description: 'la description de mon acquis',
        hintStatus: 'some hint status',
        status: Skill.STATUSES.ARCHIVE,
        tubeId: 'tubeId',
        competenceId: 'competenceId',
        version: 2,
        level: 1,
        name: '@baseTube1',
        tutorialIds: ['monTuto1Id'],
        learningMoreTutorialIds: ['monTuto2Id'],
        internationalisation: 'France',
      };
      const skillABC_clone_data = {
        ...skillABC_data,
        id: 'skillABC_clone',
      };
      const skillABC = airtableBuilder.factory.buildSkill(skillABC_data);
      const skillABC_clone = airtableBuilder.factory.buildSkill(skillABC_clone_data);
      nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .query(true)
        .times(2)
        .reply(200, { records: [skillABC, skillABC_clone] });
      const archiveProtoAttachment = domainBuilder.buildAttachment({
        id: 'archiveProtoAttachmentId',
        url: 'url attach archiveProto',
        type: 'type attach archiveProto',
        size: 1,
        mimeType: 'mimeType1',
        filename: 'filename_archiveproto',
        challengeId: 'archiveProtoForSkillABC',
        localizedChallengeId: 'archiveProtoForSkillABC',
      });
      attachmentRepository.listByLocalizedChallengeIds.mockResolvedValue([archiveProtoAttachment]);

      const archiveProtoForActifSkill = domainBuilder.buildChallenge({
        id: 'archiveProtoForSkillABC',
        status: Challenge.STATUSES.ARCHIVE,
        skillId: 'skillABC',
        genealogy: 'Prototype 1',
        version: 4,
        focusable: false,
        locales: ['fr'],
        archivedAt: new Date('2020-01-01').toISOString(),
        translations: { fr: { instruction: 'instruction archiveProto fr' } },
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({
            id: 'archiveProtoForSkillABC',
            challengeId: 'archiveProtoForSkillABC',
            embedUrl: 'archiveProto embedUrl',
            fileIds: [archiveProtoAttachment.id],
            locale: 'fr',
            status: null,
            geography: 'France',
            urlsToConsult: ['http://archiveProto.com'],
          }),
        ],
      });
      const challenges = [archiveProtoForActifSkill];

      vi.spyOn(challengeRepository, 'listBySkillId')
        .mockImplementation((skillId) => challenges.filter((challenge) => challenge.skillId === skillId));
      vi.spyOn(challengeRepository, 'getMany').mockResolvedValue([]);
      challengeRepository.createBatch.mockImplementationOnce(() => {
        throw new Error('ERREUR challengeRepository.createBatch');
      });

      // when
      await expect(() => script.fix({ dryRun: false, scriptExectIdToFix, scriptExectId: myCurrentScriptId })).rejects.toThrowError('ERREUR challengeRepository.createBatch');
      const historic_focus = await knex('historic_focus').select('*').where({ scriptExectId: myCurrentScriptId });
      expect(historic_focus).toStrictEqual([
        {
          id: expect.any(Number),
          persistantId: skillABC_data.id,
          errorStr: expect.any(String),
          details: `Erreur lors de la création en masse des épreuves clonées. Potentielles données à nettoyer (liste dans l'ordre de création):
          challenges valideProtoForActifSkillNewId sur Airtable,
          translations avec les patterns "challenge.valideProtoForActifSkillNewId%" sur PG,
          localizedChallenges dont les challengeIds sont valideProtoForActifSkillNewId sur PG`,
          createdAt: expect.anything(),
          dryRun: false,
          scriptExectId: expect.anything(),
        },
      ]);
    });

    it('attachment creation fails', async() => {
      // given
      const scriptExectIdToFix = '1718928111121';
      await knex('historic_focus').insert([
        {
          persistantId: 'skillABC',
          scriptExectId: scriptExectIdToFix,
          dryRun: false,
          createdAt: new Date('2020-01-01'),
        },
      ]);
      await knex('focus_phrase').insert([
        {
          type: 'skill',
          persistantId : 'skillABC_clone',
          originPersistantId : 'skillABC',
          scriptExectId: scriptExectIdToFix,
        },
      ]);
      idGenerator.generateNewId
        .mockReturnValueOnce('valideProtoForActifSkillNewId');
      const skillABC_data = {
        id: 'skillABC',
        description: 'la description de mon acquis',
        hintStatus: 'some hint status',
        status: Skill.STATUSES.ARCHIVE,
        tubeId: 'tubeId',
        competenceId: 'competenceId',
        version: 2,
        level: 1,
        name: '@baseTube1',
        tutorialIds: ['monTuto1Id'],
        learningMoreTutorialIds: ['monTuto2Id'],
        internationalisation: 'France',
      };
      const skillABC_clone_data = {
        ...skillABC_data,
        id: 'skillABC_clone',
      };
      const skillABC = airtableBuilder.factory.buildSkill(skillABC_data);
      const skillABC_clone = airtableBuilder.factory.buildSkill(skillABC_clone_data);
      nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .query(true)
        .times(2)
        .reply(200, { records: [skillABC, skillABC_clone] });
      const archiveProtoAttachment = domainBuilder.buildAttachment({
        id: 'archiveProtoAttachmentId',
        url: 'url attach archiveProto',
        type: 'type attach archiveProto',
        size: 1,
        mimeType: 'mimeType1',
        filename: 'filename_archiveproto',
        challengeId: 'archiveProtoForSkillABC',
        localizedChallengeId: 'archiveProtoForSkillABC',
      });
      attachmentRepository.listByLocalizedChallengeIds.mockResolvedValue([archiveProtoAttachment]);

      const archiveProtoForActifSkill = domainBuilder.buildChallenge({
        id: 'archiveProtoForSkillABC',
        status: Challenge.STATUSES.ARCHIVE,
        skillId: 'skillABC',
        genealogy: 'Prototype 1',
        version: 4,
        focusable: false,
        locales: ['fr'],
        archivedAt: new Date('2020-01-01').toISOString(),
        translations: { fr: { instruction: 'instruction archiveProto fr' } },
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({
            id: 'archiveProtoForSkillABC',
            challengeId: 'archiveProtoForSkillABC',
            embedUrl: 'archiveProto embedUrl',
            fileIds: [archiveProtoAttachment.id],
            locale: 'fr',
            status: null,
            geography: 'France',
            urlsToConsult: ['http://archiveProto.com'],
          }),
        ],
      });
      const challenges = [archiveProtoForActifSkill];

      vi.spyOn(challengeRepository, 'listBySkillId')
        .mockImplementation((skillId) => challenges.filter((challenge) => challenge.skillId === skillId));
      vi.spyOn(challengeRepository, 'getMany').mockResolvedValue([]);
      attachmentRepository.createBatch.mockImplementationOnce(() => {
        throw new Error('ERREUR attachmentRepository.createBatch');
      });

      // when
      await expect(() => script.fix({ dryRun: false, scriptExectIdToFix, scriptExectId: myCurrentScriptId })).rejects.toThrowError('ERREUR attachmentRepository.createBatch');
      const historic_focus = await knex('historic_focus').select('*').where({ scriptExectId: myCurrentScriptId });
      expect(historic_focus).toStrictEqual([
        {
          id: expect.any(Number),
          persistantId: skillABC_data.id,
          errorStr: expect.any(String),
          details: `Erreur lors de la création en masse des attachments clonés. Potentielles données à nettoyer (liste dans l'ordre de création):
          challenges valideProtoForActifSkillNewId sur Airtable,
          translations avec les patterns "challenge.valideProtoForActifSkillNewId%" sur PG,
          localizedChallenges dont les challengeIds sont valideProtoForActifSkillNewId sur PG,
          attachments dont les challengeIds persistant sont valideProtoForActifSkillNewId sur Airtable,
          localized_challenges-attachments dont les localizedChallengeIds sont valideProtoForActifSkillNewId sur PG`,
          createdAt: expect.anything(),
          dryRun: false,
          scriptExectId: expect.anything(),
        },
      ]);
    });

    it('challenge obsolete fails', async() => {
      // given
      const scriptExectIdToFix = '1718928111121';
      await knex('historic_focus').insert([
        {
          persistantId: 'skillABC',
          scriptExectId: scriptExectIdToFix,
          dryRun: false,
          createdAt: new Date('2020-01-01'),
        },
      ]);
      await knex('focus_phrase').insert([
        {
          type: 'skill',
          persistantId : 'skillABC_clone',
          originPersistantId : 'skillABC',
          scriptExectId: scriptExectIdToFix,
        },
        {
          type: 'challenge',
          persistantId: 'challengeToPerime1',
          originPersistantId : 'challengeOrigine1',
          scriptExectId: scriptExectIdToFix,
        },
      ]);
      idGenerator.generateNewId
        .mockReturnValueOnce('valideProtoForActifSkillNewId');
      const skillABC_data = {
        id: 'skillABC',
        description: 'la description de mon acquis',
        hintStatus: 'some hint status',
        status: Skill.STATUSES.ARCHIVE,
        tubeId: 'tubeId',
        competenceId: 'competenceId',
        version: 2,
        level: 1,
        name: '@baseTube1',
        tutorialIds: ['monTuto1Id'],
        learningMoreTutorialIds: ['monTuto2Id'],
        internationalisation: 'France',
      };
      const skillABC_clone_data = {
        ...skillABC_data,
        id: 'skillABC_clone',
      };
      const skillABC = airtableBuilder.factory.buildSkill(skillABC_data);
      const skillABC_clone = airtableBuilder.factory.buildSkill(skillABC_clone_data);
      nock('https://api.airtable.com')
        .get('/v0/airtableBaseValue/Acquis')
        .matchHeader('authorization', 'Bearer airtableApiKeyValue')
        .query(true)
        .times(2)
        .reply(200, { records: [skillABC, skillABC_clone] });
      attachmentRepository.listByLocalizedChallengeIds.mockImplementation(() => []);

      const archiveProtoForActifSkill = domainBuilder.buildChallenge({
        id: 'archiveProtoForSkillABC',
        status: Challenge.STATUSES.ARCHIVE,
        skillId: 'skillABC',
        genealogy: 'Prototype 1',
        version: 4,
        focusable: false,
        locales: ['fr'],
        archivedAt: new Date('2020-01-01').toISOString(),
        translations: { fr: { instruction: 'instruction archiveProto fr' } },
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({
            id: 'archiveProtoForSkillABC',
            challengeId: 'archiveProtoForSkillABC',
            embedUrl: 'archiveProto embedUrl',
            fileIds: [],
            locale: 'fr',
            status: null,
            geography: 'France',
            urlsToConsult: ['http://archiveProto.com'],
          }),
        ],
      });

      const challengeToPerime1_data = {
        id: 'challengeToPerime1',
        status: Challenge.STATUSES.VALIDE,
        skillId: 'skillABC_clone',
        locales: ['fr'],
        archivedAt: null,
        madeObsoleteAt: null,
        translations: { fr: { instruction: 'instruction valide fr' } },
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({
            id: 'challengeToPerime1Id',
            challengeId: 'challengeToPerime1Id',
            embedUrl: 'valide embedUrl',
            fileIds: [],
            locale: 'fr',
            status: null,
            geography: 'France',
            urlsToConsult: ['http://valide.com'],
          }),
        ],
      };
      const challengeToPerime1 = domainBuilder.buildChallenge(challengeToPerime1_data);
      const challenges = [archiveProtoForActifSkill, challengeToPerime1];

      vi.spyOn(challengeRepository, 'listBySkillId')
        .mockImplementation((skillId) => challenges.filter((challenge) => challenge.skillId === skillId));
      vi.spyOn(challengeRepository, 'getMany')
        .mockResolvedValue([challengeToPerime1]);

      // when
      await script.fix({ dryRun: false, scriptExectIdToFix, scriptExectId: myCurrentScriptId });

      // then
      expect(challengeRepository.updateBatch).toHaveBeenCalledTimes(1);
      expect(challengeRepository.updateBatch).toHaveBeenCalledWith([
        domainBuilder.buildChallenge({
          ...challengeToPerime1_data,
          status: Challenge.STATUSES.PERIME,
          madeObsoleteAt: obsoleteAt.toISOString(),
        }),
      ]);
    });
  });
});

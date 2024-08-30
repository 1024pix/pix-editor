import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cloneSkill } from '../../../../lib/domain/usecases/index.js';
import { domainBuilder } from '../../../test-helper.js';
import { Skill } from '../../../../lib/domain/models/index.js';
import * as transformers from '../../../../lib/infrastructure/transformers/index.js';
import { logger } from '../../../../lib/infrastructure/logger.js';
import * as Sentry from '@sentry/node';

describe('Unit | Domain | Usecases | clone-skill', () => {
  let attachmentRepository, skillRepository, challengeRepository, tubeRepository, generateNewIdFnc, updatedRecordNotifier, transformChallenge, filterSkillsFields;
  let dependencies;
  const userId = 123;
  const pixApiClient = Symbol('pixApiClient');

  beforeEach(() => {
    skillRepository = {
      get: vi.fn(),
      listByTubeId: vi.fn(),
      create: vi.fn(),
    };
    tubeRepository = {
      get: vi.fn(),
    };
    challengeRepository = {
      listBySkillId: vi.fn(),
      createBatch: vi.fn(),
    };
    attachmentRepository = {
      listByLocalizedChallengeIds: vi.fn(),
      createBatch: vi.fn(),
    };
    generateNewIdFnc = vi.fn();
    updatedRecordNotifier = { notify: vi.fn() };
    dependencies = {
      attachmentRepository,
      skillRepository,
      challengeRepository,
      tubeRepository,
      generateNewIdFnc,
      pixApiClient,
      updatedRecordNotifier,
    };
    transformChallenge = vi.fn();
    vi.spyOn(transformers, 'createChallengeTransformer').mockReturnValue(transformChallenge);
    filterSkillsFields = vi.spyOn(transformers.skillTransformer, 'filterSkillsFields');
  });

  describe('pre-checks KO', () => {
    it('should throw an error when level is not valid', async () => {
      // given
      const cloneCommand = {
        tubeDestinationId: 'tubeABCId',
        level: -1,
        changelogText: '',
        skillIdToClone: 'skillABC1Id',
        userId,
      };
      skillRepository.get.mockResolvedValue(domainBuilder.buildSkill({ id: cloneCommand.skillIdToClone }));
      tubeRepository.get.mockResolvedValue(domainBuilder.buildTube({ id: cloneCommand.tubeDestinationId }));

      // when
      const promise = cloneSkill({ cloneCommand, dependencies });

      // then
      await expect(promise).rejects.toThrow('Le niveau doit être compris entre 1 et 7');
    });

    it('should throw an error when tube does not exist', async () => {
      // given
      const cloneCommand = {
        tubeDestinationId: 'tubeABCId',
        level: 7,
        changelogText: '',
        skillIdToClone: 'skillABC1Id',
        userId,
      };
      skillRepository.get.mockResolvedValue('un super acquis');
      tubeRepository.get.mockResolvedValue(null);

      // when
      const promise = cloneSkill({ cloneCommand, dependencies });

      // then
      await expect(promise).rejects.toThrow('Le sujet d\'id "tubeABCId" n\'existe pas');
    });

    it('should throw an error when skill does not exist', async () => {
      // given
      const cloneCommand = {
        tubeDestinationId: 'tubeABCId',
        level: 7,
        changelogText: '',
        skillIdToClone: 'skillABC1Id',
        userId,
      };
      skillRepository.get.mockResolvedValue(null);
      tubeRepository.get.mockResolvedValue(domainBuilder.buildTube({ id: cloneCommand.tubeDestinationId }));

      // when
      const promise = cloneSkill({ cloneCommand, dependencies });

      // then
      await expect(promise).rejects.toThrow('L\'acquis d\'id "skillABC1Id" n\'existe pas');
    });

    it('should throw an error when skill is not live', async () => {
      // given
      const cloneCommand = {
        tubeDestinationId: 'tubeABCId',
        level: 7,
        changelogText: '',
        skillIdToClone: 'skillABC1Id',
        userId,
      };
      skillRepository.get.mockResolvedValue(domainBuilder.buildSkill({
        id: cloneCommand.skillIdToClone,
        status: Skill.STATUSES.ARCHIVE,
      }));
      tubeRepository.get.mockResolvedValue(domainBuilder.buildTube({ id: cloneCommand.tubeDestinationId }));

      // when
      const promise = cloneSkill({ cloneCommand, dependencies });

      // then
      await expect(promise).rejects.toThrow('Impossible de cloner un acquis qui ne soit ni en construction ni actif');
    });
  });

  describe('pre-check OK', () => {
    let cloneCommand, spyCloneFnc, skillToClone, tube, challengeToClone1, challengeToClone2, tubeSkill1, tubeSkill2, attachmentToClone1;
    beforeEach(() => {
      cloneCommand = {
        tubeDestinationId: 'tubeABCId',
        level: 4,
        changelogText: '',
        skillIdToClone: 'skillABC1Id',
        userId,
      };
      skillToClone = domainBuilder.buildSkill({ id: cloneCommand.skillIdToClone });
      skillRepository.get.mockResolvedValue(skillToClone);
      tube = domainBuilder.buildTube({ id: cloneCommand.tubeDestinationId });
      tubeRepository.get.mockResolvedValue(tube);
      challengeToClone1 = domainBuilder.buildChallenge({
        id: 'challenge1',
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({ id: 'challenge1' }),
          domainBuilder.buildLocalizedChallenge({ id: 'localizedChallengeA' }),
        ],
      });
      challengeToClone2 = domainBuilder.buildChallenge({
        id: 'challenge2',
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({ id: 'challenge2' }),
          domainBuilder.buildLocalizedChallenge({ id: 'localizedChallengeB' }),
        ],
      });
      challengeRepository.listBySkillId.mockResolvedValue([challengeToClone1, challengeToClone2]);
      tubeSkill1 = domainBuilder.buildSkill({ id: 'tubeSkill1', tubeId: cloneCommand.tubeDestinationId });
      tubeSkill2 = domainBuilder.buildSkill({ id: 'tubeSkill2', tubeId: cloneCommand.tubeDestinationId });
      skillRepository.listByTubeId.mockResolvedValue([tubeSkill1, tubeSkill2]);
      attachmentToClone1 = domainBuilder.buildAttachment({ id: 'challenge1_attachment' });
      attachmentRepository.listByLocalizedChallengeIds.mockResolvedValue([attachmentToClone1]);
      skillRepository.create.mockResolvedValue();
      challengeRepository.createBatch.mockResolvedValue();
      attachmentRepository.createBatch.mockResolvedValue();
    });

    it('should call the cloning method with expected arguments', async () => {
      // given
      spyCloneFnc = vi.spyOn(skillToClone, 'cloneSkillAndChallenges').mockReturnValue({
        clonedSkill: 'clonedSkill',
        clonedChallenges: [{ id: 'challengeId' }],
        clonedAttachments: [{ challengeId: 'attachmentChallengeId', localizedChallengeId: 'attachmentLocalizedChallengeId' }],
      });

      // when
      await cloneSkill({ cloneCommand, dependencies });

      // then
      expect(skillRepository.get).toHaveBeenCalledWith(cloneCommand.skillIdToClone);
      expect(tubeRepository.get).toHaveBeenCalledWith(cloneCommand.tubeDestinationId);
      expect(challengeRepository.listBySkillId).toHaveBeenCalledWith(cloneCommand.skillIdToClone);
      expect(skillRepository.listByTubeId).toHaveBeenCalledWith(cloneCommand.tubeDestinationId);
      expect(attachmentRepository.listByLocalizedChallengeIds).toHaveBeenCalledWith(['challenge1', 'localizedChallengeA', 'challenge2', 'localizedChallengeB']);
      expect(spyCloneFnc).toHaveBeenCalledWith({
        tubeDestination: tube,
        level: cloneCommand.level,
        skillChallenges: [challengeToClone1, challengeToClone2],
        tubeSkills: [tubeSkill1, tubeSkill2],
        attachments: [attachmentToClone1],
        generateNewIdFnc,
      });
    });

    it('should send to persistance to clone entities', async () => {
      // given
      const clonedSkill = Symbol('clonedSkill');
      const clonedChallenges = [Symbol('clonedChallenges')];
      const clonedAttachments = [
        { challengeId: 'notPrimaryChal', localizedChallengeId: 'notPrimaryLoc' },
        { challengeId: 'primaryChallengeId', localizedChallengeId: 'primaryChallengeId' },
      ];
      spyCloneFnc = vi.spyOn(skillToClone, 'cloneSkillAndChallenges').mockReturnValue({
        clonedSkill,
        clonedChallenges,
        clonedAttachments,
      });

      // when
      await cloneSkill({ cloneCommand, dependencies });

      // then
      expect(skillRepository.create).toHaveBeenCalledWith(clonedSkill);
      expect(challengeRepository.createBatch).toHaveBeenCalledWith(clonedChallenges);
      expect(attachmentRepository.createBatch).toHaveBeenCalledWith([{ challengeId: 'primaryChallengeId', localizedChallengeId: 'primaryChallengeId' }]);
    });

    it('should update records for preview',  async() => {
      // given
      const clonedSkill = Symbol('clonedSkill');
      const clonedChallenge = { id: 'clonedChallenge', isPrimary: true };
      const clonedChallenges = [clonedChallenge, { id: 'clonedChallenge2', isPrimary: false }];
      const clonedAttachments = [
        { challengeId: 'notPrimaryChal', localizedChallengeId: 'notPrimaryLoc' },
        { challengeId: 'primaryChallengeId', localizedChallengeId: 'primaryChallengeId' },
      ];
      spyCloneFnc = vi.spyOn(skillToClone, 'cloneSkillAndChallenges').mockReturnValue({
        clonedSkill,
        clonedChallenges,
        clonedAttachments,
      });
      const transformedSkill = Symbol('transformedSkill');
      filterSkillsFields.mockReturnValue([transformedSkill]);
      const transformedChallenge =  Symbol('transformedChallenge');
      transformChallenge.mockReturnValue(transformedChallenge);

      // when
      await cloneSkill({ cloneCommand, dependencies });

      // then
      expect(filterSkillsFields).toHaveBeenCalledOnce();
      expect(filterSkillsFields).toHaveBeenCalledWith([clonedSkill]);
      expect(transformChallenge).toHaveBeenCalledOnce();
      expect(transformChallenge).toHaveBeenCalledWith(clonedChallenge);
      expect(updatedRecordNotifier.notify).toHaveBeenCalledTimes(2);
      expect(updatedRecordNotifier.notify).toHaveBeenNthCalledWith(1, { updatedRecord: transformedSkill, model: 'skills', pixApiClient });
      expect(updatedRecordNotifier.notify).toHaveBeenNthCalledWith(2, { updatedRecord: transformedChallenge, model: 'challenges', pixApiClient });
    });

    describe('when patching fails', () => {
      let logError, captureException;

      beforeEach(() => {
        logError = vi.spyOn(logger, 'error');
        captureException = vi.spyOn(Sentry, 'captureException');
      });

      it('should still resolve', async () => {
        // given
        const clonedSkill = Symbol('clonedSkill');
        const clonedChallenges = [{ id: 'clonedChallenge', isPrimary: true }];
        spyCloneFnc = vi.spyOn(skillToClone, 'cloneSkillAndChallenges').mockReturnValue({
          clonedSkill,
          clonedChallenges,
          clonedAttachments: [],
        });
        const transformedSkill = Symbol('transformedSkill');
        filterSkillsFields.mockReturnValue([transformedSkill]);
        const error = Symbol('error');
        updatedRecordNotifier.notify.mockRejectedValue(error);

        // when
        await cloneSkill({ cloneCommand, dependencies });

        // then
        expect(filterSkillsFields).toHaveBeenCalledOnce();
        expect(filterSkillsFields).toHaveBeenCalledWith([clonedSkill]);
        expect(updatedRecordNotifier.notify).toHaveBeenCalledTimes(1);
        expect(updatedRecordNotifier.notify).toHaveBeenNthCalledWith(1, { updatedRecord: transformedSkill, model: 'skills', pixApiClient });
        expect(logError).toHaveBeenCalledWith(error);
        expect(captureException).toHaveBeenCalledWith(error);
      });
    });
  });
});

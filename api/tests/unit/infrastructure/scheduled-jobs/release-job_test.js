import { beforeEach, describe, expect, it, vi } from 'vitest';
import { releaseRepository } from '../../../../lib/infrastructure/repositories/index.js';
import { Release } from '../../../../lib/domain/models/release/Release.js';
import releaseJobProcessor from '../../../../lib/infrastructure/scheduled-jobs/release-job-processor.js';
import * as learningContentNotification from '../../../../lib/domain/services/learning-content-notification.js';
import * as downloadTranslationFromPhraseUseCase from '../../../../lib/domain/usecases/download-translation-from-phrase.js';
import { logger } from '../../../../lib/infrastructure/logger.js';
import { SlackNotifier } from '../../../../lib/infrastructure/notifications/SlackNotifier.js';
import * as config from '../../../../lib/config.js';

describe('Unit | Infrastructure | scheduled-jobs | release-job', () => {

  describe('#createRelease', () => {
    const resolvedCreatedRelease = new Release({ id: 1, content: 'JSON content', createdAt: new Date() });

    it('should create and persist a new Release in data repository', async () => {
      // given
      vi.spyOn(downloadTranslationFromPhraseUseCase, 'downloadTranslationFromPhrase').mockResolvedValue();
      vi.spyOn(releaseRepository, 'create').mockResolvedValue(resolvedCreatedRelease);
      vi.spyOn(learningContentNotification, 'notifyReleaseCreationSuccess').mockResolvedValue();

      // when
      await releaseJobProcessor({ data: {} });

      // then
      expect(releaseRepository.create).toHaveBeenCalled();
    });

    describe('when release creation succeeded', () => {

      const resolvedCreatedReleaseId = 1;

      beforeEach(() => {
        vi.spyOn(downloadTranslationFromPhraseUseCase, 'downloadTranslationFromPhrase').mockResolvedValue();
        vi.spyOn(releaseRepository, 'create').mockResolvedValue(resolvedCreatedReleaseId);
        vi.spyOn(learningContentNotification, 'notifyReleaseCreationSuccess').mockResolvedValue();
      });

      it('should return the persisted release ID', async () => {
        // when
        const releaseId = await releaseJobProcessor({ data: {} });

        // then
        expect(releaseId).to.exist;
        expect(releaseId).to.equal(resolvedCreatedReleaseId);
      });

      it('should log the success', async () => {
        //given
        const successLogStub = vi.spyOn(logger, 'info');

        //when
        await releaseJobProcessor({ data: {} });

        //then
        expect(successLogStub).toHaveBeenCalled();
      });

      it('should send a Slack success notification if slack notification is enabled', async () => {
        // given
        vi.spyOn(config.notifications, 'slack', 'get').mockReturnValue({ webhookUrl: 'http://webook.url', enable: true });

        // when
        await releaseJobProcessor({ data: { slackNotification: true } });

        // then
        expect(learningContentNotification.notifyReleaseCreationSuccess).toHaveBeenCalledWith(new SlackNotifier('http://webook.url'));
      });

      it('should not send a slack success notification if slack notification is is globally disabled', async function() {
        // given
        vi.spyOn(config.notifications.slack, 'enable', 'get').mockReturnValue(false);

        // When
        await releaseJobProcessor({ data: { slackNotification: true } });

        // Then
        expect(learningContentNotification.notifyReleaseCreationSuccess).not.toHaveBeenCalled();
      });

      it('should not send a slack success notification if slack notification is locally disabled', async function() {
        // given
        vi.spyOn(config.notifications.slack, 'enable', 'get').mockReturnValue(true);

        // When
        await releaseJobProcessor({ data: { slackNotification: false } });

        // Then
        expect(learningContentNotification.notifyReleaseCreationSuccess).not.toHaveBeenCalled();
      });
    });

    describe('when release creation failed', () => {

      beforeEach(() => {
        vi.spyOn(downloadTranslationFromPhraseUseCase, 'downloadTranslationFromPhrase').mockResolvedValue();
        vi.spyOn(releaseRepository, 'create').mockRejectedValue(new Error('Network error'));
        vi.spyOn(learningContentNotification, 'notifyReleaseCreationFailure').mockResolvedValue();
      });

      it('should log the error', async () => {
        // given
        const errorLogStub = vi.spyOn(logger, 'error');

        // when
        await releaseJobProcessor({ data: {} });

        // then
        expect(errorLogStub).toHaveBeenCalled();
      });

      it('should send a Slack notification with error message if Slack notification is enabled', async () => {
        // given
        vi.spyOn(config.notifications, 'slack', 'get').mockReturnValue({ webhookUrl: 'http://webook.url', enable: true });

        // when
        await releaseJobProcessor({ data: { slackNotification: false } });

        // then
        expect(learningContentNotification.notifyReleaseCreationFailure).toHaveBeenCalledWith('Network error', new SlackNotifier('http://webook.url'));
      });

      it('should not send a slack failure notification if Slack notification is disabled', async function() {
        // given
        vi.spyOn(config.notifications.slack, 'enable', 'get').mockReturnValue(false);

        // When
        await releaseJobProcessor({ data: {} });

        // Then
        expect(learningContentNotification.notifyReleaseCreationFailure).not.toHaveBeenCalled();
      });
    });
  });
});

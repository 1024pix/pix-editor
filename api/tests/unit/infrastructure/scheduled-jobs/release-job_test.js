import { expect, sinon } from '../../../test-helper.js';
import { releaseRepository } from '../../../../lib/infrastructure/repositories/index.js';
import { Release } from '../../../../lib/domain/models/release/Release.js';
import releaseJobProcessor from '../../../../lib/infrastructure/scheduled-jobs/release-job-processor.cjs';
import * as learningContentNotification from '../../../../lib/domain/services/learning-content-notification.js';
import { logger } from '../../../../lib/infrastructure/logger.js';
import { SlackNotifier } from '../../../../lib/infrastructure/notifications/SlackNotifier.js';
import * as config from '../../../../lib/config.js';

describe('Unit | Infrastructure | scheduled-jobs | release-job', () => {

  describe('#createRelease', () => {
    const resolvedCreatedRelease = new Release({ id: 1, content: 'JSON content', createdAt: new Date() });

    it('should create and persist a new Release in data repository', async () => {
      // given
      sinon.stub(releaseRepository, 'create').resolves(resolvedCreatedRelease);
      sinon.stub(learningContentNotification, 'notifyReleaseCreationSuccess').resolves();

      // when
      await releaseJobProcessor({ data: {} });

      // then
      expect(releaseRepository.create).to.have.been.called;
    });

    describe('when release creation succeeded', () => {

      const resolvedCreatedReleaseId = 1;

      beforeEach(() => {
        sinon.stub(releaseRepository, 'create').resolves(resolvedCreatedReleaseId);
        sinon.stub(learningContentNotification, 'notifyReleaseCreationSuccess').resolves();
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
        const successLogStub = sinon.stub(logger, 'info');

        //when
        await releaseJobProcessor({ data: {} });

        //then
        expect(successLogStub).to.have.been.called;
      });

      it('should send a Slack success notification if slack notification is enabled', async () => {
        // given
        sinon.stub(config.notifications, 'slack').value({ webhookUrl: 'http://webook.url', enable: true });

        // when
        await releaseJobProcessor({ data: { slackNotification: true } });

        // then
        expect(learningContentNotification.notifyReleaseCreationSuccess).to.have.been.calledWith(new SlackNotifier('http://webook.url'));
      });

      it('should not send a slack success notification if slack notification is is globally disabled', async function() {
        // given
        sinon.stub(config.notifications.slack, 'enable').value(false);

        // When
        await releaseJobProcessor({ data: { slackNotification: true } });

        // Then
        expect(learningContentNotification.notifyReleaseCreationSuccess).to.not.have.been.called;
      });

      it('should not send a slack success notification if slack notification is locally disabled', async function() {
        // given
        sinon.stub(config.notifications.slack, 'enable').value(true);

        // When
        await releaseJobProcessor({ data: { slackNotification: false } });

        // Then
        expect(learningContentNotification.notifyReleaseCreationSuccess).to.not.have.been.called;
      });
    });

    describe('when release creation failed', () => {

      beforeEach(() => {
        sinon.stub(releaseRepository, 'create').throws(new Error('Network error'));
        sinon.stub(learningContentNotification, 'notifyReleaseCreationFailure').resolves();
      });

      it('should log the error', async () => {
        // given
        const errorLogStub = sinon.stub(logger, 'error');

        // when
        await releaseJobProcessor({ data: {} });

        // then
        expect(errorLogStub).to.have.been.called;
      });

      it('should send a Slack notification with error message if Slack notification is enabled', async () => {
        // given
        sinon.stub(config.notifications, 'slack').value({ webhookUrl: 'http://webook.url', enable: true });

        // when
        await releaseJobProcessor({ data: { slackNotification: false } });

        // then
        expect(learningContentNotification.notifyReleaseCreationFailure).to.have.been.calledWith('Network error', new SlackNotifier('http://webook.url'));
      });

      it('should not send a slack failure notification if Slack notification is disabled', async function() {
        // given
        sinon.stub(config.notifications.slack, 'enable').value(false);

        // When
        await releaseJobProcessor({ data: {} });

        // Then
        expect(learningContentNotification.notifyReleaseCreationFailure).to.not.have.been.called;
      });
    });
  });
});

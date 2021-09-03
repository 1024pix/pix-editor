const { expect, sinon } = require('../../../test-helper');
const releaseRepository = require('../../../../lib/infrastructure/repositories/release-repository');
const Release = require('../../../../lib/domain/models/Release');
const releaseJob = require('../../../../lib/infrastructure/scheduled-jobs/release-job');
const learningContentNotification = require('../../../../lib/domain/services/learning-content-notification');
const logger = require('../../../../lib/infrastructure/logger');
const SlackNotifier = require('../../../../lib/infrastructure/notifications/SlackNotifier');
const config = require('../../../../lib/config');

describe('Unit | Infrastructure | scheduled-jobs | release-job', () => {

  describe('#createRelease', () => {
    const resolvedCreatedRelease = new Release({ id: 1, content: 'JSON content', createdAt: new Date() });

    it('should create and persist a new Release in data repository', async () => {
      // given
      sinon.stub(releaseRepository, 'create').resolves(resolvedCreatedRelease);
      sinon.stub(learningContentNotification, 'notifyReleaseCreationSuccess').resolves();

      // when
      await releaseJob.createRelease();

      // then
      expect(releaseRepository.create).to.have.been.called;
    });

    describe('when release creation succeeded', () => {

      const resolvedCreatedRelease = new Release({ id: 1, content: 'JSON content', createdAt: new Date() });

      beforeEach(() => {
        sinon.stub(releaseRepository, 'create').resolves(resolvedCreatedRelease);
        sinon.stub(learningContentNotification, 'notifyReleaseCreationSuccess').resolves();
      });

      it('should return the persisted release ID', async () => {
        // when
        const releaseId = await releaseJob.createRelease();

        // then
        expect(releaseId).to.exist;
        expect(releaseId).to.equal(resolvedCreatedRelease.id);
      });

      it('should send a Slack success notification', async () => {
        // given
        sinon.stub(config.notifications, 'slack').value({ webhookUrl: 'http://webook.url', enable: true });
        
        // when
        await releaseJob.createRelease();

        // then
        expect(learningContentNotification.notifyReleaseCreationSuccess).to.have.been.calledWith(new SlackNotifier('http://webook.url'));
      });

      it('should log the success', async () => {
        //given
        const successLogStub = sinon.stub(logger, 'debug');

        //when
        await releaseJob.createRelease();

        //then
        expect(successLogStub).to.have.been.called;
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
        await releaseJob.createRelease();

        // then
        expect(errorLogStub).to.have.been.called;
      });

      it('should send a Slack notification with error message', async () => {
        // given
        sinon.stub(config.notifications, 'slack').value({ webhookUrl: 'http://webook.url', enable: true });

        // when
        await releaseJob.createRelease();

        // then
        expect(learningContentNotification.notifyReleaseCreationFailure).to.have.been.calledWith('Network error',new SlackNotifier('http://webook.url'));
      });
    });

    describe('when slack notification is enable', function() {
      it('should send a Slack success notification', async function() {
        // given
        sinon.stub(releaseRepository, 'create').resolves(resolvedCreatedRelease);
        sinon.stub(learningContentNotification, 'notifyReleaseCreationSuccess').resolves();
        sinon.stub(config.notifications, 'slack').value({ webhookUrl: 'http://webook.url', enable: true });

        // when
        await releaseJob.createRelease();

        // then
        expect(learningContentNotification.notifyReleaseCreationSuccess).to.have.been.calledWith(new SlackNotifier('http://webook.url'));
      });

      it('should send a Slack failure notification', async function() {
        // given
        sinon.stub(releaseRepository, 'create').throws(new Error('Network error'));
        sinon.stub(learningContentNotification, 'notifyReleaseCreationFailure').resolves();
        sinon.stub(config.notifications, 'slack').value({ webhookUrl: 'http://webook.url', enable: true });

        // when
        await releaseJob.createRelease();

        // then
        expect(learningContentNotification.notifyReleaseCreationFailure).to.have.been.calledWith('Network error',new SlackNotifier('http://webook.url'));
      });
      
    });
    
    describe('when slack notification is disabled', function() {
      it('should not send a slack success notification', async function() {
        // given
        sinon.stub(releaseRepository, 'create').resolves(resolvedCreatedRelease);
        sinon.stub(learningContentNotification, 'notifyReleaseCreationSuccess').resolves();
        sinon.stub(config.notifications.slack, 'enable').value(false);

        // When
        await releaseJob.createRelease();

        // Then
        expect(learningContentNotification.notifyReleaseCreationSuccess).to.not.have.been.called;
      });

      it('should not send a slack failure notification', async function() {
        // given
        sinon.stub(releaseRepository, 'create').throws(new Error('Network error'));
        sinon.stub(learningContentNotification, 'notifyReleaseCreationFailure').resolves();
        sinon.stub(config.notifications.slack, 'enable').value(false);
        
        // When
        await releaseJob.createRelease();
        
        // Then
        expect(learningContentNotification.notifyReleaseCreationFailure).to.not.have.been.called;
      });
    });
  });

});

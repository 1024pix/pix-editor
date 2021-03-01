const nock = require('nock');
const { expect, sinon } = require('../../../test-helper');
const createdReleaseNotifier = require('../../../../lib/infrastructure/event-notifier/created-release-notifier');

describe('Unit | Infrastructure | EventNotifier | CreatedReleaseNotifier', () => {

  afterEach(function() {
    nock.cleanAll();
  });

  describe('#Notify', () => {

    it('should call the webhook when a release is created', async () => {
      // given
      const pixApiClient = { request: sinon.stub() };

      // when
      await createdReleaseNotifier.notify({ pixApiClient });

      // then
      expect(pixApiClient.request).to.have.been.calledWith({ url: '/api/cache/' });
    });
  });

});

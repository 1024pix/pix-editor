const SlackNotifier = require('../../../../lib/infrastructure/notifications/SlackNotifier');
const config = require('../../../../lib/config');
const { expect, sinon } = require('../../../test-helper');
const axios = require('axios');

describe('Unit | Infrastructure | SlackNotifier', function() {
  describe('#send', function() {
    it('should send slack notifications with given blocks', function() {
      // given
      const slackNotifier = new SlackNotifier();
      const blocks = Symbol();
      const stubAxiosPost = sinon.stub(axios, 'post');

      // when
      slackNotifier.send(blocks);

      // then
      const expectedUrl = config.notifications.slack.webhookUrl;
      expect(stubAxiosPost).to.have.been.calledWithExactly(expectedUrl, blocks, { headers: { 'content-type': 'application/json' } });
    });
  });
});

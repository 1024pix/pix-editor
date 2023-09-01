import { SlackNotifier } from '../../../../lib/infrastructure/notifications/SlackNotifier.js';
import { expect, sinon } from '../../../test-helper.js';
import axios from 'axios';

describe('Unit | Infrastructure | SlackNotifier', function() {
  describe('#constructor', function() {
    it('should throw an error when webhookUrl is not defined', function() {

      // when
      try {
        new SlackNotifier(null);
        expect.fail('Should throw exception');
        // Then
      } catch (e) {
        expect(e.message).to.equal('WebhookURL is required');
      }
    });

    it('should be an instance of slack notifier', function() {
      // given
      const webhookUrl = 'http://webhook.url/test';

      // when
      const slacknotifier = new SlackNotifier(webhookUrl);

      // then
      expect(slacknotifier).to.be.instanceOf(SlackNotifier);
      expect(slacknotifier.webhookUrl).to.equal(webhookUrl);
    });
  });
  describe('#send', function() {
    it('should send slack notifications with given blocks', function() {
      // given
      const webhookUrl = 'https://webhook.url';
      const slackNotifier = new SlackNotifier(webhookUrl);
      const blocks = Symbol();
      const stubAxiosPost = sinon.stub(axios, 'post');

      // when
      slackNotifier.send(blocks);

      // then
      expect(stubAxiosPost).to.have.been.calledWithExactly(webhookUrl, blocks, { headers: { 'content-type': 'application/json' } });
    });
  });

});

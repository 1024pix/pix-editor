import { describe, expect, it } from 'vitest';
import { SlackNotifier } from '../../../../lib/infrastructure/notifications/SlackNotifier.js';
import nock from 'nock';

describe('Integration | Infrastructure | SlackNotifier', function() {
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
  });

  describe('#send', function() {
    it('should send slack notifications with given blocks', async function() {
      // given
      const webhookUrl = 'https://webhook.url';
      const slackNotifier = new SlackNotifier(`${webhookUrl}/testurl`);
      const blocks = Symbol();

      const sendScope = nock(webhookUrl)
        .post('/testurl', JSON.stringify(blocks))
        .reply(200, { 'Content-Type': 'application/json' });

      // when
      await slackNotifier.send(blocks);

      // then
      expect(sendScope.isDone()).to.be.true;
    });
  });
});

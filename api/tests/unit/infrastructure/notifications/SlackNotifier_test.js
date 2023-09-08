import { describe, expect, it, vi } from 'vitest';
import { SlackNotifier } from '../../../../lib/infrastructure/notifications/SlackNotifier.js';
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
  });

  describe('#send', function() {
    it('should send slack notifications with given blocks', function() {
      // given
      const webhookUrl = 'https://webhook.url';
      const slackNotifier = new SlackNotifier(webhookUrl);
      const blocks = Symbol();
      const stubAxiosPost = vi.spyOn(axios, 'post').mockResolvedValue();

      // when
      slackNotifier.send(blocks);

      // then
      expect(stubAxiosPost).toHaveBeenCalledWith(webhookUrl, blocks, { headers: { 'content-type': 'application/json' } });
    });
  });

});

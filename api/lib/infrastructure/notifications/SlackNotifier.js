import axios from 'axios';

import { child } from '../logger';

const logger = child('slack-notifier', { event: 'slack-notifier' });

export class SlackNotifier {
  constructor(webhookUrl) {
    if (!webhookUrl) {
      throw new Error('WebhookURL is required');
    }
    this.webhookUrl = webhookUrl;
  }

  async send(blocks) {
    try {
      await axios.post(this.webhookUrl, blocks, { headers: { 'content-type': 'application/json' } });
    } catch (err) {
      logger.error({ err }, 'error while sending notification to slack');
    }
  }
}

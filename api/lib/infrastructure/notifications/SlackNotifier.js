import { child } from '../logger.js';

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
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        body: JSON.stringify(blocks),
        headers: { 'content-type': 'application/json' },
      });
      if (!response.ok) {
        logger.error('error while sending notification to Slack', { status: response.status, content: await response.text().catch() });
        throw new Error(`error while sending notification to Slack with status ${response.status}`);
      };
    } catch (err) {
      logger.error({ err }, 'error while sending notification to slack');
    }
  }
}

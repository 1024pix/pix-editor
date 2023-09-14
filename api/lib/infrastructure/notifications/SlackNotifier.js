import axios from 'axios';

export class SlackNotifier {
  constructor(webhookUrl) {
    if (!webhookUrl) {
      throw new Error('WebhookURL is required');
    }
    this.webhookUrl = webhookUrl;
  }

  send(blocks) {
    return axios.post(this.webhookUrl, blocks, { headers: { 'content-type': 'application/json' } });
  }
}

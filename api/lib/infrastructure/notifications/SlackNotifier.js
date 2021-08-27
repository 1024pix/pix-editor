const axios = require('axios');
const config = require('../../config');

class SlackNotifier {

  send(blocks) {
    const webhookUrl = config.notifications.slack.webhookUrl;
    return axios.post(webhookUrl, blocks, { headers: { 'content-type': 'application/json' } });
  }

}

module.exports = SlackNotifier;

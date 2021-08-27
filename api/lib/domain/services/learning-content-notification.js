function notifyReleaseCreationSuccess(slackNotifier) {
  const blocks = {
    attachments: [
      {
        mrkdwn_in: ['text'],
        color: '#5bc0de',
        title: 'Information',
        text: 'Une nouvelle version du référentiel vient d’être déployée.',
      }
    ]
  };
  return slackNotifier.send(blocks);
}

function notifyReleaseCreationFailure(errorMessage, slackNotifier) {
  const blocks = {
    attachments: [
      {
        mrkdwn_in: ['text'],
        color: '#d9534f',
        title: 'Information',
        text: 'Une erreur s’est produite lors du déploiement du référentiel.',
        fields: [
          {
            title: 'Error',
            value: errorMessage,
            short: false
          },
        ],
      }
    ]
  };
  return slackNotifier.send(blocks);
}

module.exports = {
  notifyReleaseCreationSuccess,
  notifyReleaseCreationFailure,
};


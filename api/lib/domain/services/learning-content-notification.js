export function notifyReleaseCreationSuccess(slackNotifier) {
  const blocks = {
    attachments: [
      {
        mrkdwn_in: ['text'],
        color: '#5bc0de',
        title: 'Information',
        text: 'Une nouvelle version du référentiel vient d’être créée.',
      }
    ]
  };
  return slackNotifier.send(blocks);
}

export function notifyReleaseCreationFailure(errorMessage, slackNotifier) {
  const blocks = {
    attachments: [
      {
        mrkdwn_in: ['text'],
        color: '#d9534f',
        title: 'Information',
        text: 'Une erreur s’est produite lors de la création de la version du référentiel.',
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

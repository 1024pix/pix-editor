export function externalUrlBuilder(databaseBuilder) {
  databaseBuilder.factory.buildTutorialExternalUrl({ tutorial_id: 'tutorial1', url: 'https://link-to-tuto1.com' });
  databaseBuilder.factory.buildTutorialExternalUrl({ tutorial_id: 'tutorial1', url: 'https://link-to-tuto2.com' });
  databaseBuilder.factory.buildTutorialExternalUrl({ tutorial_id: 'tutorial2', url: 'https://link-to-tuto2.com' });

  databaseBuilder.factory.buildChallengeExternalUrl({ challenge_id: 'challengeF0A0C0Th0Tu0S0ActCh0', url: 'https://link-to-challenge1.com' });
  databaseBuilder.factory.buildChallengeExternalUrl({ challenge_id: 'challengeF0A0C0Th0Tu0S0ActCh0', url: 'https://link-to-challenge2.com' });
  databaseBuilder.factory.buildChallengeExternalUrl({ challenge_id: 'challengeF0A0C0Th0Tu0S0ActCh1', url: 'https://link-to-challenge2.com' });
}

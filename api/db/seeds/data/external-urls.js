export function externalUrlBuilder({ databaseBuilder, tutorials, learningContentData }) {
  const localizedChallengeId = learningContentData[0].areas[0].competences[0].thematics[0].tubes[0].skills[0].challenges[0].id;
  databaseBuilder.factory.buildExternalUrl({ url: 'https://patate.pix.org', tutorialIds: [], localizedChallengeIds: [localizedChallengeId] });
  databaseBuilder.factory.buildExternalUrl({ url: 'https://chocolat.pix.org', tutorialIds: [tutorials[0].id], localizedChallengeIds: [] });
  databaseBuilder.factory.buildExternalUrl({ url: 'https://fromage.pix.org', tutorialIds: [tutorials[0].id], localizedChallengeIds: [localizedChallengeId] });
}

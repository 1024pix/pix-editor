export function buildLocalizedFrameworkTubesFromConfig({ databaseBuilder, learningContentConfig, learningContentData }) {
  const allTubes = learningContentData.flatMap((framework) =>
    framework.areas
      .flatMap((area) => area.competences)
      .flatMap((competence) => competence.thematics)
      .flatMap((thematics) => thematics.tubes),
  );
  const liveTubes = allTubes.filter(({ name }) => name !== '@workbench');
  for (const tube of liveTubes) {
    for (const locale of learningContentConfig.locales) {
      const localizedFrameworkTubeItem = {
        tubeId: tube.id,
        maxLevel: learningContentConfig.localizedFrameworkTubesMaxLevel,
        locale,
      };
      databaseBuilder.factory.buildLocalizedFrameworkTubes(localizedFrameworkTubeItem);
    }
  }
}

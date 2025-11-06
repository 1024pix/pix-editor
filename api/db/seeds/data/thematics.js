export async function buildThematicsFromConfig({ databaseBuilder, learningContentConfig, learningContentData }) {
  const thematicItems = [];
  const allCompetences = learningContentData.flatMap((framework) =>
    framework.areas.flatMap((area) => area.competences),
  );
  for (const competenceItem of allCompetences) {
    for (let i = 0; i < learningContentConfig.cntThematicsPerCompetence; ++i) {
      const thematicItem = buildThematic({
        indexThematic: i,
        competenceItem,
        databaseBuilder,
        locales: learningContentConfig.locales,
        isWorkbench: false,
      });
      thematicItems.push(thematicItem);
      competenceItem.thematics.push(thematicItem);
    }
    const thematicWorkbenchItem = buildThematic({
      competenceItem,
      databaseBuilder,
      locales: learningContentConfig.locales,
      isWorkbench: true,
    });
    thematicItems.push(thematicWorkbenchItem);
    competenceItem.thematics.push(thematicWorkbenchItem);
  }
  thematicItems.forEach((thematicItem) => {
    thematicItem.tubes = [];
  });
}

export function buildThematic({ indexThematic, competenceItem, databaseBuilder, locales, isWorkbench }) {
  const partId = competenceItem.id.split('competence')[1];
  const thematicId = `thematic${partId}Th${isWorkbench ? 'W' : indexThematic}`;
  let thematicName;
  if (isWorkbench) {
    if (competenceItem.origin === 'Pix') {
      thematicName = `workbench_${competenceItem.index.split('.')[0]}_${competenceItem.index.split('.')[1]}`;
    } else {
      thematicName = `workbench_${competenceItem.origin}_${competenceItem.index.split('.')[0]}_${competenceItem.index.split('.')[1]}`;
    }
  } else {
    thematicName = `${thematicId} name`;
  }
  const thematicItem = {
    id: thematicId,
    index: isWorkbench ? 0 : indexThematic,
    competenceId: competenceItem.id,
    name: thematicName,
  };
  databaseBuilder.factory.buildThematic(thematicItem);
  locales.forEach((locale) => {
    databaseBuilder.factory.buildTranslation({
      locale,
      key: `thematic.${thematicItem.id}.name`,
      value: `${thematicItem.name} ${locale}`,
    });
  });
  return thematicItem;
}

const TUBE_NAMES_POOL = [
  'noix',
  'amande',
  'cajou',
  'pistache',
  'noisette',
  'abricot',
  'banane',
  'courgette',
  'datte',
  'epinard',
  'fraise',
  'goyave',
  'haricot',
  'igname',
  'jujube',
  'kaki',
  'laitue',
  'mandarine',
  'nefle',
  'orange',
  'panais',
  'quenette',
  'raisin',
  'salsifis',
  'topinambour',
  'usufruit',
  'vruit',
  'wagon',
  'xylophone',
  'yack',
  'zebre',
  'brocoli',
  'poireau',
  'cresson',
  'pasteque',
  'papaye',
  'olive',
  'myrtille',
  'kiwi',
  'groseille',
  'pomme',
  'coing',
];

function* getTubeName() {
  let i = 0;
  let j = 1;
  while (true) {
    yield `${TUBE_NAMES_POOL[j]}${TUBE_NAMES_POOL[i].at(0).toUpperCase() + TUBE_NAMES_POOL[i].slice(1)}`;
    ++i;
    if (i === TUBE_NAMES_POOL.length) {
      ++j;
      i = 0;
    }
    if (j === TUBE_NAMES_POOL.length) {
      j = 0;
    }
  }
}

const pickTubeName = getTubeName();

export function buildTubesFromConfig({ databaseBuilder, learningContentConfig, learningContentData }) {
  const tubeItems = [];
  const allThematics = learningContentData.flatMap((framework) =>
    framework.areas.flatMap((area) => area.competences).flatMap((competence) => competence.thematics),
  );
  for (const thematicItem of allThematics) {
    if (thematicItem.name.includes('workbench')) {
      const tubeItemWorkbench = buildTube({
        thematicItem,
        databaseBuilder,
        locales: learningContentConfig.locales,
        isWorkbench: true,
      });
      thematicItem.tubes.push(tubeItemWorkbench);
      tubeItems.push(tubeItemWorkbench);
    } else {
      for (let i = 0; i < learningContentConfig.cntTubesPerThematic; ++i) {
        const tubeItem = buildTube({
          indexTube: i,
          thematicItem,
          databaseBuilder,
          locales: learningContentConfig.locales,
          isWorkbench: false,
        });
        thematicItem.tubes.push(tubeItem);
        tubeItems.push(tubeItem);
      }
    }
  }
  tubeItems.forEach((tubeItem) => {
    tubeItem.skills = [];
  });
}

export function buildTube({ indexTube, suffix = '', thematicItem, databaseBuilder, locales, isWorkbench }) {
  const partId = thematicItem.id.split('thematic')[1];
  const tubeId = `tube${partId}Tu${isWorkbench ? 'W' : indexTube}`;
  const tubePracticalDescription = `${tubeId} practicalDescription`;
  const tubePracticalTitle = `${tubeId} practicalTitle`;
  const tubeName = isWorkbench ? '@workbench' : `@${pickTubeName.next().value}${suffix}`;
  const tubeIndex = isWorkbench ? null : indexTube;
  const tubeItem = {
    id: tubeId,
    index: tubeIndex,
    name: tubeName,
    thematicId: thematicItem.id,
    practicalDescription: tubePracticalDescription,
    practicalTitle: tubePracticalTitle,
  };
  databaseBuilder.factory.buildTube(tubeItem);
  locales.forEach((locale) => {
    databaseBuilder.factory.buildTranslation({
      locale,
      key: `tube.${tubeItem.id}.practicalTitle`,
      value: `${tubeItem.practicalTitle} ${locale}`,
    });
    databaseBuilder.factory.buildTranslation({
      locale,
      key: `tube.${tubeItem.id}.practicalDescription`,
      value: `${tubeItem.practicalDescription} ${locale}`,
    });
  });
  return tubeItem;
}

import { ensureMainLocaleExists } from './utils.js';

export function buildAreasFromConfig({ databaseBuilder, learningContentConfig, learningContentData }) {
  const areaItems = [];
  for (let i = 0; i < learningContentConfig.cntFrameworks; ++i) {
    for (let j = 0; j < learningContentConfig.cntAreasPerFramework; ++j) {
      const frameworkItem = learningContentData[i];
      const areaItem = buildArea({
        indexFramework: i,
        indexArea: j,
        frameworkItem,
        databaseBuilder,
        locales: learningContentConfig.locales,
      });
      frameworkItem.areas.push(areaItem);
      areaItems.push(areaItem);
    }
  }

  areaItems.forEach((areaItem) => {
    areaItem.competences = [];
  });
}

export function buildArea({ indexFramework, indexArea, frameworkItem, databaseBuilder, locales }) {
  const id = `areaF${indexFramework}A${indexArea}`;
  const code = `${indexArea + 1}`;
  const title = `${id} title`;

  const area = {
    id: id,
    code,
    frameworkId: frameworkItem.id,
  };
  databaseBuilder.factory.buildArea(area);

  ensureMainLocaleExists(locales)
    .forEach((locale) => {
      databaseBuilder.factory.buildTranslation({
        locale,
        key: `area.${id}.title`,
        value: `${title} ${locale}`,
      });
    });

  return area;
}

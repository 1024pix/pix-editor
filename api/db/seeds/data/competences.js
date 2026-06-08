import { transformLocalesToUniqLangArray } from './utils.js';

export async function buildCompetencesFromConfig({ databaseBuilder, learningContentConfig, learningContentData }) {
  const competenceItems = [];
  const allAreas = learningContentData.flatMap((framework) => framework.areas);
  for (const areaItem of allAreas) {
    for (let i = 0; i < learningContentConfig.cntCompetencesPerArea; ++i) {
      const competenceItem = buildCompetence({
        indexCompetence: i,
        areaItem,
        databaseBuilder,
        locales: learningContentConfig.locales,
      });
      areaItem.competences.push(competenceItem);
      competenceItems.push(competenceItem);
    }
  }
  competenceItems.forEach((competenceItem) => {
    competenceItem.thematics = [];
  });
}

export function buildCompetence({ indexCompetence, areaItem, databaseBuilder, locales }) {
  const partId = areaItem.id.split('area')[1];
  const competenceId = `competence${partId}C${indexCompetence}`;
  const competenceName = `${competenceId} name`;
  const competenceDescription = `${competenceId} description`;
  const competenceItem = {
    id: competenceId,
    index: `${areaItem.code}.${indexCompetence + 1}`,
    areaId: areaItem.id,
    name: competenceName,
    description: competenceDescription,
  };
  databaseBuilder.factory.buildCompetence(competenceItem);
  transformLocalesToUniqLangArray(locales)
    .forEach((locale) => {
      databaseBuilder.factory.buildTranslation({
        locale,
        key: `competence.${competenceItem.id}.name`,
        value: `${competenceItem.name} ${locale}`,
      });
      databaseBuilder.factory.buildTranslation({
        locale,
        key: `competence.${competenceItem.id}.description`,
        value: `${competenceItem.description} ${locale}`,
      });
    });
  return competenceItem;
}

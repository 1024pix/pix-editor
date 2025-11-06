import { cycle } from './utils.js';
import { Tutorial } from '../../../lib/domain/models/index.js';

const iterFor = {
  format: cycle(Object.values(Tutorial.FORMATS)),
  level: cycle(Object.values(Tutorial.LEVELS)),
  license: cycle(Object.values(Tutorial.LICENSES)),
  crush: cycle([true, false]),
};
let iterTags;
let iterLocales;
export function buildTutorials({ databaseBuilder, locales, tagItems }) {
  iterTags = cycle(tagItems);
  iterLocales = cycle(locales);
  const tutorialItems = [];
  let i = 0;
  tutorialItems.push(
    buildTutorial({
      databaseBuilder,
      title: 'Faire ses courses',
      index: i++,
      tagItems: [],
    }),
  );
  tutorialItems.push(
    buildTutorial({
      databaseBuilder,
      title: 'Se laver les dents',
      index: i++,
      tagItems: [iterTags.next().value],
    }),
  );
  tutorialItems.push(
    buildTutorial({
      databaseBuilder,
      title: 'Payer ses impôts',
      index: i++,
      tagItems: [iterTags.next().value, iterTags.next().value],
    }),
  );
  tutorialItems.push(
    buildTutorial({
      databaseBuilder,
      title: 'Faire son lit',
      index: i++,
      tagItems: [],
    }),
  );
  tutorialItems.push(
    buildTutorial({
      databaseBuilder,
      title: 'Saluer ses voisins',
      index: i++,
      tagItems: [iterTags.next().value],
    }),
  );

  return tutorialItems;
}

export function buildTutorial({ databaseBuilder, title, index, tagItems }) {
  const tutorialId = `tutorial${index}`;
  const tutorial = {
    id: tutorialId,
    title: `${title} - Tuto${index}`,
    duration: `0${index}:0${index}:0${index}`,
    source: `My source ${index}`,
    format: iterFor.format.next().value,
    link: `https://link-to-tuto${index}.com`,
    license: iterFor.license.next().value,
    level: iterFor.level.next().value,
    crush: iterFor.crush.next().value,
    locale: iterLocales.next().value,
    tagIds: tagItems.map((tagItem) => tagItem.id),
  };
  databaseBuilder.factory.buildTutorial(tutorial);
  return tutorial;
}

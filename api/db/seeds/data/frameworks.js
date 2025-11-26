export function buildFrameworksFromConfig({ databaseBuilder, learningContentConfig }) {
  const frameworkItems = [];
  for (let indexFramework = 0; indexFramework < learningContentConfig.cntFrameworks; ++indexFramework) {
    const name = indexFramework === 0 ? 'Pix' : `RéfComplémentaire_${indexFramework}`;
    frameworkItems.push(buildFramework({ name, indexFramework, databaseBuilder }));
  }

  return frameworkItems.map((frameworkItem) => {
    return {
      ...frameworkItem,
      areas: [],
    };
  });
}

export function buildFramework({ name, indexFramework, databaseBuilder }) {
  return databaseBuilder.factory.buildFramework({
    id: `frameworkF${indexFramework}`,
    name,
  });
}

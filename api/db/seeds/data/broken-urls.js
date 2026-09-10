export function brokenUrlsBuilder(databaseBuilder) {
  databaseBuilder.factory.buildBrokenUrl({
    id: 1,
    statusCode: 404,
    errorMessage: 'Not found',
    url: 'https://patate.pix.org',
  });
  databaseBuilder.factory.buildBrokenUrl({
    id: 2,
    statusCode: 500,
    errorMessage: "C'est cassé",
    url: 'https://chocolat.pix.org',
  });
  databaseBuilder.factory.buildBrokenUrl({
    id: 3,
    statusCode: 404,
    errorMessage: 'Perdu',
    url: 'https://fromage.pix.org',
  });
  databaseBuilder.factory.buildBrokenUrl({
    id: 4,
    statusCode: 500,
    errorMessage: "C'est cassé",
    url: 'https://poire.pix.org',
  });
}

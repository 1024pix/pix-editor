export function brokenUrlsBuilder(databaseBuilder) {
  databaseBuilder.factory.buildBrokenUrl({
    id: 1,
    statusCode: 404,
    errorMessage: 'Not found',
    url: 'https://link-to-tuto1.com',
  });
  databaseBuilder.factory.buildBrokenUrl({
    id: 2,
    statusCode: 500,
    errorMessage: "C'est cassé",
    url: 'https://link-to-tuto2.com',
  });
  databaseBuilder.factory.buildBrokenUrl({
    id: 3,
    statusCode: 404,
    errorMessage: 'Perdu',
    url: 'https://link-to-challenge1.com',
  });
  databaseBuilder.factory.buildBrokenUrl({
    id: 4,
    statusCode: 500,
    errorMessage: "C'est cassé",
    url: 'https://link-to-challenge2.com',
  });
}


export function brokenUrlsBuilder(databaseBuilder, adminId) {
  databaseBuilder.factory.buildBrokenUrl({
    statusCode: 400,
    errorMessage: 'Not found',
    url: 'https://link-to-tuto1.com',
  });
  databaseBuilder.factory.buildBrokenUrl({
    statusCode: 500,
    errorMessage: "C'est cassé",
    url: 'https://link-to-tuto2.com',
  });
}

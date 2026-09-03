export function serialize(externalUrls) {
  const links = externalUrls.map(({ id, url }) => {
    return `<a href="${url}">${id}</a>`;
  }).join('');

  return `<!DOCTYPE html><html><body>${links}</body><style>a{display:block;}</style></html>`;
}

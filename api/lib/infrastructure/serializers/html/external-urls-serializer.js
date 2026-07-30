
export function serialize(externalUrls) {
  const links = externalUrls.map(({ id, url, type }) => {
    const urlTypePrefix = type[0];

    return `<a href="${url}">${urlTypePrefix} ${id.split(', ')[0]}</a>`;
  }).join('');

  return `<!DOCTYPE html><html><body>${links}</body><style>a{display:block;}</style></html>`;
}

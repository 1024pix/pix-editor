const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function duplicateModule({ moduleData }) {
  const duplicated = _recursivelyRegenerateUuids(moduleData);
  duplicated.shortId = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  duplicated.slug = `${moduleData.slug}-copie`;
  duplicated.title = `${moduleData.title} (copie)`;
  return duplicated;
}

function _recursivelyRegenerateUuids(node) {
  if (Array.isArray(node)) {
    return _recursivelyRegenerateUuidsInArray(node);
  }

  const nodeIsAnObject = node !== null && typeof node === 'object';
  if (nodeIsAnObject) {
    return _recursivelyRegenerateUuidsInObject(node);
  }

  return node;
}

function _recursivelyRegenerateUuidsInArray(node) {
  return node.map(_recursivelyRegenerateUuids);
}

function _recursivelyRegenerateUuidsInObject(node) {
  return Object.fromEntries(
    Object.entries(node).map(([propertyName, propertyValue]) => {
      const isPropertyAnUuid
        = propertyName === 'id' && typeof propertyValue === 'string' && UUID_REGEX.test(propertyValue);
      const newValue = isPropertyAnUuid ? crypto.randomUUID() : _recursivelyRegenerateUuids(propertyValue);
      return [propertyName, newValue];
    }),
  );
}

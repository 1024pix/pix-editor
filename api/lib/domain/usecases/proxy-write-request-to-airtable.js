import * as repositories from '../../infrastructure/repositories/index.js';

export async function proxyWriteRequestToAirtable(request, airtableBase, tableName, {
  proxyRequestToAirtable,
  tableTranslations,
  translationRepository = repositories.translationRepository,
  updateStagingPixApiCache,
}) {
  let translations;
  if (tableTranslations.writeToPgEnabled) {
    translations = tableTranslations.extractFromProxyObject(request.payload.fields);
  }

  if (tableTranslations.writeToAirtableDisabled) {
    tableTranslations.dehydrateAirtableObject(request.payload?.fields);
  }

  const response = await proxyRequestToAirtable(request, airtableBase);

  if (!_isResponseOK(response)) {
    return response;
  }

  if (tableTranslations.writeToPgEnabled) {
    if (request.method === 'patch') {
      await translationRepository.deleteByKeyPrefix(tableTranslations.prefixFor(response.data.fields));
    }
    await translationRepository.save(translations);
  }

  if (tableTranslations.readFromPgEnabled) {
    tableTranslations.hydrateProxyObject(response.data.fields, translations);
  }

  await updateStagingPixApiCache(tableName, response.data, translations);

  return response;
}

function _isResponseOK(response) {
  return response.status >= 200 && response.status < 300;
}

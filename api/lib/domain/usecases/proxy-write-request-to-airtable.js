import * as repositories from '../../infrastructure/repositories/index.js';

export async function proxyWriteRequestToAirtable(request, airtableBase, tableName, {
  proxyRequestToAirtable,
  tableTranslations,
  translationRepository = repositories.translationRepository,
  updateStagingPixApiCache,
}) {
  const requestFields = request.payload.fields;

  if (tableTranslations.writeToAirtableDisabled) {
    request.payload.fields = tableTranslations.proxyObjectToAirtableObject(requestFields);
  }

  const response = await proxyRequestToAirtable(request, airtableBase);

  if (!_isResponseOK(response)) {
    return response;
  }

  let translations;
  if (tableTranslations.writeToPgEnabled) {
    if (request.method === 'patch') {
      await translationRepository.deleteByKeyPrefix(tableTranslations.prefixFor(response.data.fields));
    }

    translations = tableTranslations.extractFromProxyObject(requestFields);

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

import * as repositories from '../../infrastructure/repositories/index.js';

export async function proxyReadRequestToAirtable(request, airtableBase, {
  proxyRequestToAirtable,
  tableTranslations,
  translationRepository = repositories.translationRepository
}) {
  const response = await proxyRequestToAirtable(request, airtableBase);

  if (!_isResponseOK(response)) return response;

  if (!tableTranslations.readFromPgEnabled) return response;

  if (response.data.records) {
    const translations = await translationRepository.listByPrefix(tableTranslations.prefix);
    response.data.records = response.data.records.map((entity) => tableTranslations.airtableObjectToProxyObject(entity, translations));
  } else {
    const translations = await translationRepository.listByPrefix(tableTranslations.prefixFor(response.data));
    response.data = tableTranslations.airtableObjectToProxyObject(response.data, translations);
  }

  return response;
}

function _isResponseOK(response) {
  return response.status >= 200 && response.status < 300;
}

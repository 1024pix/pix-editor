import * as repositories from '../../infrastructure/repositories/index.js';

export async function proxyWriteRequestToAirtable(request, airtableBase, tableName, {
  proxyRequestToAirtable,
  tableTranslations,
  translationRepository = repositories.translationRepository,
  localizedChallengesAttachmentsRepository = repositories.localizedChallengesAttachmentsRepository,
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

  const isCreatingAttachment = tableName === 'Attachments' && request.method === 'post';

  if (isCreatingAttachment) {
    const localizedChallengeId = response.data.fields.localizedChallengeId;
    const attachmentId = response.data.id;
    await localizedChallengesAttachmentsRepository.save({
      localizedChallengeId,
      attachmentId
    });
  }

  let translations;
  if (tableTranslations.writeToPgEnabled) {
    if (request.method === 'patch') {
      const prefix = tableTranslations.prefixFor(response.data.fields);
      await translationRepository.deleteByKeyPrefixAndLocales({
        prefix,
        locales: ['fr', 'fr-fr', 'en'],
      });
    }

    translations = tableTranslations.extractFromProxyObject(requestFields);

    await translationRepository.save({ translations });
  }

  if (tableTranslations.readFromPgEnabled) {
    response.data.fields = tableTranslations.airtableObjectToProxyObject(response.data.fields, translations);
  }
  await updateStagingPixApiCache(tableName, response.data, translations);

  return response;
}

function _isResponseOK(response) {
  return response.status >= 200 && response.status < 300;
}

import * as repositories from '../../infrastructure/repositories/index.js';

export async function proxyWriteRequestToAirtable(request, airtableBase, tableName, {
  proxyRequestToAirtable,
  tableTranslations,
  translationRepository = repositories.translationRepository,
  localizedChallengesAttachmentsRepository = repositories.localizedChallengesAttachmentsRepository,
  updateStagingPixApiCache,
}) {
  const requestPayload = request.payload;

  if (tableTranslations.writeToAirtableDisabled) {
    request.payload = tableTranslations.proxyObjectToAirtableObject(requestPayload);
  }

  const response = await proxyRequestToAirtable(request, airtableBase);

  if (!_isResponseOK(response)) {
    return response;
  }

  const isAttachment = tableName === 'Attachments';
  const isCreatingAttachment = isAttachment && request.method === 'post';

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
      const prefix = tableTranslations.prefixFor(response.data);
      await translationRepository.deleteByKeyPrefixAndLocales({
        prefix,
        locales: ['fr', 'fr-fr', 'en'],
      });
    }

    translations = tableTranslations.extractFromProxyObject(requestPayload);

    await translationRepository.save({ translations });
  }

  if (tableTranslations.readFromPgEnabled) {
    response.data = tableTranslations.airtableObjectToProxyObject(response.data, translations);
  }

  if (isAttachment) return response;

  await updateStagingPixApiCache(tableName, response.data, translations);

  return response;
}

function _isResponseOK(response) {
  return response.status >= 200 && response.status < 300;
}

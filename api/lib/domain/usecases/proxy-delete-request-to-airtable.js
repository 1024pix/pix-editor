import * as repositories from '../../infrastructure/repositories/index.js';

export async function proxyDeleteRequestToAirtable(request, airtableBase, tableName, {
  proxyRequestToAirtable,
  localizedChallengesAttachmentsRepository = repositories.localizedChallengesAttachmentsRepository,
}) {
  const response = await proxyRequestToAirtable(request, airtableBase);
  if (tableName === 'Attachments') {
    const attachmentId  = request.params.path.split('/')[1];
    await localizedChallengesAttachmentsRepository.deleteByAttachmentId(attachmentId);
  }
  return response;
}

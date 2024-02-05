import Airtable from 'airtable';
export async function localizedChallengesAttachmentsBuilder(databaseBuilder) {
  const {
    AIRTABLE_API_KEY: airtableApiKey,
    AIRTABLE_BASE: airtableBase,
  } = process.env;

  const airtableClient = new Airtable({ apiKey: airtableApiKey }).base(airtableBase);

  const attachments = await airtableClient
    .table('Attachments')
    .select({
      fields: [
        'Record ID',
        'localizedChallengeId',
      ],
    })
    .all();

  const localizedChallengesAttachments = attachments.map((attachment) => {
    const attachmentId = attachment.get('Record ID');
    const localizedChallengeId = attachment.get('localizedChallengeId');
    return {
      attachmentId,
      localizedChallengeId,
    };
  });

  localizedChallengesAttachments.forEach(databaseBuilder.factory.buildLocalizedChallengeAttachment);
}

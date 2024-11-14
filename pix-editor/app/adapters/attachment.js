import AirtableAdapter from './airtable';

export default class AttachmentAdapter extends AirtableAdapter {

  fields = [
    'Record ID',
    'filename',
    'url',
    'mimeType',
    'size',
    'type',
    'localizedChallengeId',
  ];

  pathForType() {
    return 'Attachments';
  }
}

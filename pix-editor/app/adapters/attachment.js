import AirtableAdapter from './airtable';

export default class AttachmentAdapter extends AirtableAdapter {
  pathForType() {
    return 'Attachments';
  }

}

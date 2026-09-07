import { tracked } from '@glimmer/tracking';
import Model, { attr, belongsTo } from '@warp-drive/legacy/model';

export default class Attachment extends Model {
  @attr filename;
  @attr url;
  @attr size;
  @attr mimeType;
  @attr type;

  @tracked cloneBeforeSave;

  @belongsTo('challenge', { async: true, inverse: 'attachments' }) challenge;
  @belongsTo('localized-challenge', { async: true, inverse: 'attachments' }) localizedChallenge;
}

import Model, { attr, belongsTo } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';

export default class Attachment extends Model {
  @attr filename;
  @attr url;
  @attr size;
  @attr mimeType;
  @attr type;

  @tracked cloneBeforeSave;

  @belongsTo('challenge', { inverse: 'files' }) challenge;
  @belongsTo('localized-challenge',  { inverse: 'files' }) localizedChallenge;
}

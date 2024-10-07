import Model, { attr, belongsTo } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';

export default class Attachment extends Model {
  @attr filename;
  @attr url;
  @attr size;
  @attr mimeType;
  @attr type;

  @tracked cloneBeforeSave;

  @belongsTo('challenge', { async: true, inverse: 'files' }) challenge;
  @belongsTo('localized-challenge', { async: true, inverse: 'files' }) localizedChallenge;
}

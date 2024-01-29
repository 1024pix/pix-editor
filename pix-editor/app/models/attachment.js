import Model, { attr, belongsTo } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';

export default class Attachment extends Model {
  @attr filename;
  @attr url;
  @attr size;
  @attr mimeType;
  @attr type;
  @attr alt;

  @tracked cloneBeforeSave;

  @belongsTo('challenge') challenge;
  @belongsTo('localized-challenge',  { inverse: 'files' }) localizedChallenge;
}

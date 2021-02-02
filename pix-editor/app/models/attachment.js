import Model, { attr, belongsTo } from '@ember-data/model';

export default class Attachment extends Model {
  @attr filename;
  @attr url;
  @attr size;
  @attr mimeType;
  @attr type;
  @attr alt;

  @belongsTo('challenge') challenge;
}

import Model, { attr, hasMany } from '@ember-data/model';

export default class TutorialModel extends Model {
  @attr title;
  @attr duration;
  @attr source;
  @attr format;
  @attr link;
  @attr license;
  @attr level;
  @attr date;
  @attr crush;
  @attr pixId;
  @attr language;

  @hasMany('tag') tags;

  get tagsTitle() {
    return this.tags.map(tag => tag.title).join(' | ');
  }
}

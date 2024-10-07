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

  @hasMany('tag', { async: true, inverse: 'tutorials' }) tags;

  get tagsTitle() {
    const tags = this.hasMany('tags').value() || [];
    return tags.map((tag) => tag.title).join(' | ');
  }
}

import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class BrokenUrlsIndexController extends Controller {
  queryParams = ['url', 'statusCode', 'skills', 'localizedChallenges'];
  @tracked url = '';
  @tracked statusCode = '';
  @tracked skills = [];
  @tracked localizedChallenges = [];

  @action
  applyFilters(field, filterValue) {
    this[field] = filterValue ?? '';
  }

  get filterBrokenUrls() {
    const urlFilter = this.url ?? '';
    const statusCodeFilter = this.statusCode ?? '';
    const skillFilters = this.skills ?? [];
    const localizedChallengeFilters = this.localizedChallenges ?? [];

    return (brokenUrl) => {
      const hasUrlFilter = brokenUrl.url.includes(urlFilter);
      const hasStatusCodeFilter = brokenUrl.statusCode.toString().includes(statusCodeFilter);

      const skills = brokenUrl.hasMany('skills').value() ?? [];
      const hasSkillFilter = skillFilters.length === 0 || skills.some((skill) => skillFilters.includes(skill.id));

      const localizedChallenges = brokenUrl.hasMany('localizedChallenges').value() ?? [];
      const hasLocalizedChallengeFilter =
        localizedChallengeFilters.length === 0 ||
        localizedChallenges.some((challenge) => localizedChallengeFilters.includes(challenge.id));

      return hasUrlFilter && hasStatusCodeFilter && hasSkillFilter && hasLocalizedChallengeFilter;
    };
  }

  @action
  clearFilters() {
    this.url = '';
    this.statusCode = '';
    this.skills = [];
    this.localizedChallenges = [];
  }
}

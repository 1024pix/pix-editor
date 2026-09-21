import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class BrokenUrlsIndexController extends Controller {
  queryParams = ['url', 'statusCode', 'skills', 'localizedChallenges', 'tutorials', 'frameworks'];
  @tracked url = '';
  @tracked statusCode = '';
  @tracked skills = [];
  @tracked localizedChallenges = [];
  @tracked tutorials = [];
  @tracked frameworks = [];

  get filterBrokenUrls() {
    const urlFilter = this.url ?? '';
    const statusCodeFilter = this.statusCode ?? '';
    const skillFilters = this.skills ?? [];
    const localizedChallengeFilters = this.localizedChallenges ?? [];
    const tutorialFilters = this.tutorials ?? [];
    const frameworkNameFilters = this.frameworks ?? [];

    return (brokenUrl) => {
      const hasUrlFilter = brokenUrl.url.includes(urlFilter);
      const hasStatusCodeFilter = brokenUrl.statusCode.toString().includes(statusCodeFilter);
      const hasFrameworkNameFilter =
        frameworkNameFilters.length === 0 ||
        brokenUrl.frameworks.some((frameworkName) => frameworkNameFilters.includes(frameworkName));

      const skills = brokenUrl.hasMany('skills').value() ?? [];
      const hasSkillFilter = skillFilters.length === 0 || skills.some((skill) => skillFilters.includes(skill.id));

      const localizedChallenges = brokenUrl.hasMany('localizedChallenges').value() ?? [];
      const hasLocalizedChallengeFilter =
        localizedChallengeFilters.length === 0 ||
        localizedChallenges.some((challenge) => localizedChallengeFilters.includes(challenge.id));

      const tutorials = brokenUrl.hasMany('tutorials').value() ?? [];
      const hasTutorialFilter =
        tutorialFilters.length === 0 || tutorials.some((tutorial) => tutorialFilters.includes(tutorial.id));

      return (
        hasUrlFilter &&
        hasStatusCodeFilter &&
        hasSkillFilter &&
        hasLocalizedChallengeFilter &&
        hasTutorialFilter &&
        hasFrameworkNameFilter
      );
    };
  }

  @action
  applyFilters(field, filterValue) {
    this[field] = filterValue ?? '';
  }

  @action
  clearFilters() {
    this.url = '';
    this.statusCode = '';
    this.skills = [];
    this.localizedChallenges = [];
    this.tutorials = [];
    this.frameworks = [];
  }
}

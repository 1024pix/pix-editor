import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class BrokenUrlsIndexController extends Controller {
  queryParams = ['url', 'statusCode', 'skills', 'localizedChallenges', 'tutorials', 'frameworks', 'ignored'];
  @tracked url = '';
  @tracked statusCode = '';
  @tracked skills = [];
  @tracked localizedChallenges = [];
  @tracked tutorials = [];
  @tracked frameworks = [];
  @tracked ignored = false;

  get brokenUrlsFilterFunction() {
    const urlFilter = this.url ?? '';
    const statusCodeFilter = this.statusCode ?? '';
    const skillFilters = this.skills ?? [];
    const localizedChallengeFilters = this.localizedChallenges ?? [];
    const tutorialFilters = this.tutorials ?? [];
    const frameworkNameFilters = this.frameworks ?? [];
    const ignoredFilter = this.ignored ?? false;

    return (brokenUrl) => {
      const hasUrlFilter = brokenUrl.url.includes(urlFilter);
      const hasStatusCodeFilter = brokenUrl.statusCode.toString().includes(statusCodeFilter);
      const hasFrameworkNameFilter =
        frameworkNameFilters.length === 0 ||
        brokenUrl.frameworks.some((frameworkName) => frameworkNameFilters.includes(frameworkName));

      const skills = brokenUrl.hasMany('skills').value() ?? [];
      const hasSkillFilter = skillFilters.length === 0 || skills.some((skill) => skillFilters.includes(skill.id));

      const isIgnored = ignoredFilter || !brokenUrl.ignored;
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
        hasFrameworkNameFilter &&
        isIgnored
      );
    };
  }

  @action
  async ignoreBrokenUrl(brokenUrl) {
    await new Promise((res) => setTimeout(res, 300)); // allow time for PixToggle animation before hiding row
    brokenUrl.ignored = !brokenUrl.ignored;
    await brokenUrl.save();
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

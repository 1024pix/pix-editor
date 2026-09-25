import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class BrokenUrlsIndexController extends Controller {
  @service router;

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

  @action
  async onIgnoreUrl(brokenUrl) {
    const skills = await this.loadEverySkillLinkedToBrokenUrl(brokenUrl);
    const skillNames = skills.map((skill) => skill.name).join(', ');

    await this.router.transitionTo('authenticated.whitelisted-urls.new', {
      queryParams: { skillNames, url: brokenUrl.url, comment: 'Faux positif (moulinette)' },
    });
  }

  async loadEverySkillLinkedToBrokenUrl(brokenUrl) {
    await brokenUrl.localizedChallenges;
    const localizedChallenges = brokenUrl.hasMany('localizedChallenges').value() ?? [];
    await Promise.all(localizedChallenges.map((localizedChallenge) => localizedChallenge.challenge));

    const challenges = localizedChallenges.map((localizedChallenge) =>
      localizedChallenge.belongsTo('challenge').value(),
    );
    await Promise.all([...challenges.map((challenge) => challenge.skill), brokenUrl.skills]);

    const skills = [
      ...challenges.map((challenge) => challenge.belongsTo('skill').value()),
      ...brokenUrl.hasMany('skills').value(),
    ];

    const skillIds = new Set();
    const deduplicatedSkills = [];
    for (const skill of skills) {
      if (skillIds.has(skill.id)) continue;
      skillIds.add(skill.id);
      deduplicatedSkills.push(skill);
    }

    return deduplicatedSkills;
  }
}

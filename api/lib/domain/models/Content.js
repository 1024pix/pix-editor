const AreaForRelease = require('./AreaForRelease');
const ChallengeForRelease = require('./ChallengeForRelease');
const CompetenceForRelease = require('./CompetenceForRelease');
const CourseForRelease = require('./CourseForRelease');
const FrameworkForRelease = require('./FrameworkForRelease');
const SkillForRelease = require('./SkillForRelease');
const ThematicForRelease = require('./ThematicForRelease');
const TubeForRelease = require('./TubeForRelease');
const TutorialForRelease = require('./TutorialForRelease');

const map = require('lodash/map');
const filter = require('lodash/filter');

module.exports = class Content {
  constructor({
    areas,
    challenges,
    competences,
    courses,
    frameworks,
    skills,
    thematics,
    tubes,
    tutorials,
  } = {}) {
    this.areas = areas;
    this.challenges = challenges;
    this.competences = competences;
    this.courses = courses;
    this.frameworks = frameworks;
    this.skills = skills;
    this.thematics = thematics;
    this.tubes = tubes;
    this.tutorials = tutorials;
  }

  static buildForRelease({
    areas,
    challenges,
    competences,
    courses,
    frameworks,
    skills,
    thematics,
    tubes,
    tutorials,
  }) {
    const content = new Content();
    content.areas = areas ? areas.map((area) => new AreaForRelease(area)) : [];
    content.challenges = challenges ? challenges.map((challenge) => new ChallengeForRelease(challenge)) : [];
    content.competences = competences ? competences.map((competence) => new CompetenceForRelease(competence)) : [];
    content.courses = courses ? courses.map((course) => new CourseForRelease(course)) : [];
    content.frameworks = frameworks ? frameworks.map((framework) => new FrameworkForRelease(framework)) : [];
    content.skills = skills ? skills.map((skill) => new SkillForRelease(skill)) : [];
    content.thematics = thematics ? thematics.map((thematic) => new ThematicForRelease(thematic)) : [];
    content.tubes = tubes ? tubes.map((tube) => new TubeForRelease(tube)) : [];
    content.tutorials = tutorials ? tutorials.map((tutorial) => new TutorialForRelease(tutorial)) : [];

    content['fr-fr'] = {
      areas: map(areas, (area) => new AreaForRelease(area, 'fr-fr')),
      challenges: filter(challenges, (challenge) => challenge.locales.includes('fr-fr'))
        .map((challenge) => new ChallengeForRelease(challenge)),
      competences: map(competences, (competence) => new CompetenceForRelease(competence, 'fr-fr')),
      courses: map(courses, (course) => new CourseForRelease(course)),
      frameworks: map(frameworks, (framework) => new FrameworkForRelease(framework)),
      skills: map(skills, (skill) => new SkillForRelease(skill, 'fr-fr')),
      thematics: map(thematics, (thematic) => new ThematicForRelease(thematic, 'fr-fr')),
      tubes: map(tubes, (tube) => new TubeForRelease(tube, 'fr-fr')),
      tutorials: filter(tutorials, (tutorial) => tutorial.locale === 'fr-fr')
        .map((tutorial) => new TutorialForRelease(tutorial)),
    };

    content['fr'] = {
      areas: map(areas, (area) => new AreaForRelease(area, 'fr')),
      challenges: filter(challenges, (challenge) => challenge.locales.includes('fr'))
        .map((challenge) => new ChallengeForRelease(challenge)),
      competences: map(competences, (competence) => new CompetenceForRelease(competence, 'fr')),
      courses: map(courses, (course) => new CourseForRelease(course)),
      frameworks: map(frameworks, (framework) => new FrameworkForRelease(framework)),
      skills: map(skills, (skill) => new SkillForRelease(skill, 'fr')),
      thematics: map(thematics, (thematic) => new ThematicForRelease(thematic, 'fr')),
      tubes: map(tubes, (tube) => new TubeForRelease(tube, 'fr')),
      tutorials: filter(tutorials, (tutorial) => tutorial.locale === 'fr-fr')
        .map((tutorial) => new TutorialForRelease(tutorial)),
    };

    content['en'] = {
      areas: map(areas, (area) => new AreaForRelease(area, 'en')),
      challenges: filter(challenges, (challenge) => challenge.locales.includes('en'))
        .map((challenge) => new ChallengeForRelease(challenge)),
      competences: map(competences, (competence) => new CompetenceForRelease(competence, 'en')),
      courses: map(courses, (course) => new CourseForRelease(course)),
      frameworks: map(frameworks, (framework) => new FrameworkForRelease(framework)),
      skills: map(skills, (skill) => new SkillForRelease(skill, 'en')),
      thematics: map(thematics, (thematic) => new ThematicForRelease(thematic, 'en')),
      tubes: map(tubes, (tube) => new TubeForRelease(tube, 'en')),
      tutorials: filter(tutorials, (tutorial) => tutorial.locale === 'en-us')
        .map((tutorial) => new TutorialForRelease(tutorial)),
    };

    return content;
  }
};

const AreaForRelease = require('./AreaForRelease');
const ChallengeForRelease = require('./ChallengeForRelease');
const CompetenceForRelease = require('./CompetenceForRelease');
const CourseForRelease = require('./CourseForRelease');
const FrameworkForRelease = require('./FrameworkForRelease');
const SkillForRelease = require('./SkillForRelease');
const ThematicForRelease = require('./ThematicForRelease');
const TubeForRelease = require('./TubeForRelease');
const TutorialForRelease = require('./TutorialForRelease');

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

    return content;
  }
};

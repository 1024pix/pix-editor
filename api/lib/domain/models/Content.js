const Area = require('./Area');
const ChallengeForRelease = require('./ChallengeForRelease');
const Competence = require('./Competence');
const Course = require('./Course');
const Framework = require('./Framework');
const Skill = require('./Skill');
const Thematic = require('./Thematic');
const Tube = require('./Tube');
const Tutorial = require('./Tutorial');

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

  static from({
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
    content.areas = areas ? areas.map((area) => new Area(area)) : [];
    content.challenges = challenges ? challenges.map((challenge) => new ChallengeForRelease(challenge)) : [];
    content.competences = competences ? competences.map((competence) => new Competence(competence)) : [];
    content.courses = courses ? courses.map((course) => new Course(course)) : [];
    content.frameworks = frameworks ? frameworks.map((framework) => new Framework(framework)) : [];
    content.skills = skills ? skills.map((skill) => new Skill(skill)) : [];
    content.thematics = thematics ? thematics.map((thematic) => new Thematic(thematic)) : [];
    content.tubes = tubes ? tubes.map((tube) => new Tube(tube)) : [];
    content.tutorials = tutorials ? tutorials.map((tutorial) => new Tutorial(tutorial)) : [];

    return content;
  }
};

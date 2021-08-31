const Area = require('./Area');
const Challenge = require('./Challenge');
const Competence = require('./Competence');
const Course = require('./Course');
const Skill = require('./Skill');
const Tutorial = require('./Tutorial');
const Tube = require('./Tube');

module.exports = class Content {
  constructor({
    // attributes
    // includes
    areas,
    challenges,
    competences,
    courses,
    skills,
    tubes,
    tutorials,
    // references
  } = {}) {
    // attributes
    // includes
    this.areas = areas;
    this.challenges = challenges;
    this.competences = competences;
    this.courses = courses;
    this.skills = skills;
    this.tubes = tubes;
    this.tutorials = tutorials;
    // references
  }

  static from({
    areas,
    challenges,
    competences,
    courses,
    skills,
    tubes,
    tutorials,
  }) {
    const content = new Content();
    content.areas = areas ? areas.map((area) => new Area(area)) : [];
    content.challenges = challenges ? challenges.map((challenge) => new Challenge(challenge)) : [];
    content.competences = competences ? competences.map((competence) => new Competence(competence)) : [];
    content.courses = courses ? courses.map((course) => new Course(course)) : [];
    content.skills = skills ? skills.map((skill) => new Skill(skill)) : [];
    content.tubes = tubes ? tubes.map((tube) => new Tube(tube)) : [];
    content.tutorials = tutorials ? tutorials.map((tutorial) => new Tutorial(tutorial)) : [];

    return content;
  }
};

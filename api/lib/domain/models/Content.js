const Area = require('./Area');
const Challenge = require('./Challenge');
const Competence = require('./Competence');
const Course = require('./Course');
const Framework = require('./Framework');
const Skill = require('./Skill');
const Thematic = require('./Thematic');
const Tube = require('./Tube');
const Tutorial = require('./Tutorial');

const map = require('lodash/map');

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
    content.challenges = challenges ? challenges.map((challenge) => new Challenge(challenge)) : [];
    content.competences = competences ? competences.map((competence) => new Competence(competence)) : [];
    content.courses = courses ? courses.map((course) => new Course(course)) : [];
    content.frameworks = frameworks ? frameworks.map((framework) => new Framework(framework)) : [];
    content.skills = skills ? skills.map((skill) => new Skill(skill)) : [];
    content.thematics = thematics ? thematics.map((thematic) => new Thematic(thematic)) : [];
    content.tubes = tubes ? tubes.map((tube) => new Tube(tube)) : [];
    content.tutorials = tutorials ? tutorials.map((tutorial) => new Tutorial(tutorial)) : [];

    content['fr-fr'] = {
      areas: map(areas, (area) => new Area(area, 'fr-fr')), 
      challenges: map(challenges, (challenge) => new Challenge(challenge)), 
      competences: map(competences, (competence) => new Competence(competence, 'fr-fr')), 
      courses: map(courses, (course) => new Course(course)), 
      frameworks: map(frameworks, (framework) => new Framework(framework)), 
      skills: map(skills, (skill) => new Skill(skill, 'fr-fr')), 
      thematics: map(thematics, (thematic) => new Thematic(thematic, 'fr-fr')), 
      tubes: map(tubes, (tube) => new Tube(tube, 'fr-fr')), 
      tutorials: map(tutorials, (tutorial) => new Tutorial(tutorial)), 
      trainings: map(trainings, (training) => new Training(training)), 
    };

    content['fr'] = {
      areas: map(areas, (area) => new Area(area, 'fr')), 
      challenges: map(challenges, (challenge) => new Challenge(challenge)), 
      competences: map(competences, (competence) => new Competence(competence, 'fr')), 
      courses: map(courses, (course) => new Course(course)), 
      frameworks: map(frameworks, (framework) => new Framework(framework)), 
      skills: map(skills, (skill) => new Skill(skill, 'fr')), 
      thematics: map(thematics, (thematic) => new Thematic(thematic, 'fr')), 
      tubes: map(tubes, (tube) => new Tube(tube, 'fr')), 
      tutorials: map(tutorials, (tutorial) => new Tutorial(tutorial)), 
      trainings: map(trainings, (training) => new Training(training)), 
    };

    content['en'] = {
      areas: map(areas, (area) => new Area(area, 'en')), 
      challenges: map(challenges, (challenge) => new Challenge(challenge)), 
      competences: map(competences, (competence) => new Competence(competence, 'en')), 
      courses: map(courses, (course) => new Course(course)), 
      frameworks: map(frameworks, (framework) => new Framework(framework)), 
      skills: map(skills, (skill) => new Skill(skill, 'en')), 
      thematics: map(thematics, (thematic) => new Thematic(thematic, 'en')), 
      tubes: map(tubes, (tube) => new Tube(tube, 'en')), 
      tutorials: map(tutorials, (tutorial) => new Tutorial(tutorial)), 
      trainings: map(trainings, (training) => new Training(training)), 
    };

    return content;
  }
};

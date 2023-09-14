import { AreaForRelease } from './AreaForRelease.js';
import { ChallengeForRelease } from './ChallengeForRelease.js';
import { CompetenceForRelease } from './CompetenceForRelease.js';
import { CourseForRelease } from './CourseForRelease.js';
import { FrameworkForRelease } from './FrameworkForRelease.js';
import { SkillForRelease } from './SkillForRelease.js';
import { ThematicForRelease } from './ThematicForRelease.js';
import { TubeForRelease } from './TubeForRelease.js';
import { TutorialForRelease } from './TutorialForRelease.js';

export class Content {
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
}

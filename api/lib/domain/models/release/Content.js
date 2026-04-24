import { AreaForRelease } from './AreaForRelease.js';
import { ChallengeForRelease } from './ChallengeForRelease.js';
import { CompetenceForRelease } from './CompetenceForRelease.js';
import { CourseForRelease } from './CourseForRelease.js';
import { FrameworkForRelease } from './FrameworkForRelease.js';
import { MissionForRelease } from './MissionForRelease.js';
import { ModuleForRelease } from './ModuleForRelease.js';
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
    missions,
    modules,
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
    this.missions = missions;
    this.modules = modules;
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
    missions,
    modules,
  }) {
    return new Content({
      areas: areas?.map((area) => new AreaForRelease(area)) ?? [],
      challenges: challenges?.map((challenge) => new ChallengeForRelease(challenge)) ?? [],
      competences: competences?.map((competence) => new CompetenceForRelease(competence)) ?? [],
      courses: courses?.map((course) => new CourseForRelease(course)) ?? [],
      frameworks: frameworks?.map((framework) => new FrameworkForRelease(framework)) ?? [],
      skills: skills?.map((skill) => new SkillForRelease(skill)) ?? [],
      thematics: thematics?.map((thematic) => new ThematicForRelease(thematic)) ?? [],
      tubes: tubes?.map((tube) => new TubeForRelease(tube)) ?? [],
      tutorials: tutorials?.map((tutorial) => new TutorialForRelease(tutorial)) ?? [],
      missions: missions?.map((mission) => new MissionForRelease(mission)) ?? [],
      modules: modules?.map((module) => new ModuleForRelease(module)) ?? [],
    });
  }
}

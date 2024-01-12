import { Content } from '../../../../lib/domain/models/release/Content.js';

export function buildContentForRelease({
  areas = [],
  challenges = [],
  competences = [],
  courses = [],
  frameworks = [],
  missions = [],
  skills = [],
  thematics = [],
  tubes = [],
  tutorials = [],
} = {}) {
  return Content.buildForRelease({
    areas,
    challenges,
    competences,
    courses,
    frameworks,
    missions,
    skills,
    thematics,
    tubes,
    tutorials,
  });
}

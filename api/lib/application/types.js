import Joi from 'joi';

const postgreSQLSequenceDefaultStart = 1;
const postgreSQLSequenceEnd = 2 ** 31 - 1;

const schemaPositiveInteger32bits = Joi.number().integer().min(postgreSQLSequenceDefaultStart).max(postgreSQLSequenceEnd);

export function areaId() {
  return Joi.string().pattern(/^(rec|area)[a-zA-Z0-9]+$/);
}

export function attachmentId() {
  return Joi.string().pattern(/^rec[a-zA-Z0-9]+$/);
}

export function frameworkId() {
  return Joi.string().pattern(/^(rec|framework)[a-zA-Z0-9]+$/);
}

export function challengeId() {
  return Joi.string().pattern(/^(rec|challenge)[a-zA-Z0-9]+$/);
}

export function competenceId() {
  return Joi.string().pattern(/^(rec|competence)[a-zA-Z0-9]+$/);
}

export function locale() {
  return Joi.string().pattern(/^[a-z]{2}(-[a-z]{2})?$/);
}

export function localizedChallengeId() {
  // the part "(-[a-zA-Z0-9]+)?" is just for the data in review apps, we got ids like recABC123-nl
  return Joi.string().pattern(/^(rec|challenge)[a-zA-Z0-9]+(-[a-zA-Z0-9]+)?$/);
}

export function skillId() {
  return Joi.string().pattern(/^(rec|skill)[a-zA-Z0-9]+$/);
}

export function thematicId() {
  return Joi.string().pattern(/^(rec|thematic)[a-zA-Z0-9]+$/);
}

export function tubeId() {
  return Joi.string().pattern(/^(rec|tube)[a-zA-Z0-9]+$/);
}

export function tutorialId() {
  return Joi.string().pattern(/^(rec|tutorial)[a-zA-Z0-9]+$/);
}

export function tutorialsRelationship() {
  return Joi.object({
    data: Joi.array().items(Joi.object({
      type: Joi.string().required().equal('tutorials'),
      id: tutorialId().required(),
    })),
  });
}

export function whitelistedUrlId() {
  return schemaPositiveInteger32bits;
}

import Joi from 'joi';

const postgreSQLSequenceDefaultStart = 1;
const postgreSQLSequenceEnd = 2 ** 31 - 1;

const schemaPositiveInteger32bits = Joi.number().integer().min(postgreSQLSequenceDefaultStart).max(postgreSQLSequenceEnd);

export const Types = Object.freeze({
  frameworkId() {
    return Joi.string().pattern(/^(rec|framework)[a-zA-Z0-9]+$/);
  },
  areaId() {
    return Joi.string().pattern(/^(rec|area)[a-zA-Z0-9]+$/);
  },
  competenceId() {
    return Joi.string().pattern(/^(rec|competence)[a-zA-Z0-9]+$/);
  },
  tubeId() {
    return Joi.string().pattern(/^(rec|tube)[a-zA-Z0-9]+$/);
  },
  skillId() {
    return Joi.string().pattern(/^(rec|skill)[a-zA-Z0-9]+$/);
  },
  locale() {
    return Joi.string().pattern(/^[a-z]{2}(-[a-z]{2})?$/);
  },
  whitelistedUrlId() {
    return schemaPositiveInteger32bits;
  }
});

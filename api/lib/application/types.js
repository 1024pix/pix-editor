import Joi from 'joi';

export const Types = Object.freeze({
  competenceId() {
    return Joi.string().pattern(/^(rec|competence)[a-zA-Z0-9]+$/);
  },
  locale() {
    return Joi.string().pattern(/^[a-z]{2}(-[a-z]{2})?$/);
  },
});

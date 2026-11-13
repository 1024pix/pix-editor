import { HtmlValidate } from 'html-validate';
import Joi from 'joi';

const uuidSchema = Joi.string().guid({ version: 'uuidv4' }).required();

const proposalIdSchema = Joi.string().regex(/^\d+$/);

const htmlValidate = new HtmlValidate({
  rules: {
    'no-style-tag': 'error',
    'element-name': [
      'error',
      {
        pattern: '[a-z][a-z0-9\\-._]*-[a-z0-9\\-._]*$',
        whitelist: [],
        blacklist: ['iframe'],
      },
    ],
  },
});
const htmlSchema = Joi.string().external(htmlValidation);

async function htmlValidation(value, helpers) {
  if (!value) {
    return;
  }

  const report = await htmlValidate.validateString(value);

  if (!report.valid) {
    return helpers.message('htmlvalidationerror', { value: report });
  }
}

const htmlNotAllowedSchema = Joi.string()
  .regex(/<.*?>/, { invert: true })
  .message('{{:#label}} failed custom validation because HTML is not allowed in this field');

const ASSETS_HOSTNAME = 'assets.pix.org';

function withAssetsHostname(schema) {
  return schema.custom((value, helpers) => {
    if (!value) return value;
    if (new URL(value).hostname !== ASSETS_HOSTNAME) {
      return helpers.message(`{{#label}} doit être hébergé sur "${ASSETS_HOSTNAME}"`);
    }
    return value;
  });
}

const CUSTOM_DRAFT_URL_PREFIXES = ['https://1024pix.github.io/atelier-contenus', 'https://1024pix.github.io/pix-epreuves-externes'];

function withCustomDraftUrlPrefix(schema) {
  return schema.custom((value, helpers) => {
    if (!CUSTOM_DRAFT_URL_PREFIXES.some((prefix) => value.startsWith(prefix))) {
      return helpers.message(
        `{{#label}} doit commencer par l'une des valeurs suivantes : ${CUSTOM_DRAFT_URL_PREFIXES.join(', ')}`,
      );
    }
    return value;
  });
}

export {
  htmlNotAllowedSchema,
  htmlSchema,
  proposalIdSchema,
  uuidSchema,
  withAssetsHostname,
  withCustomDraftUrlPrefix,
};

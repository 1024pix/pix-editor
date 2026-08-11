import { HtmlValidate } from 'html-validate';
import { z } from 'zod';

z.config(z.locales.fr());

const uuidSchema = z.string().uuid({ version: 'v4' });

const proposalIdSchema = z.string().regex(/^\d+$/);

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

const htmlSchema = z.string().superRefine(htmlValidation);

async function htmlValidation(value, ctx) {
  if (!value) {
    return;
  }

  const report = await htmlValidate.validateString(value);

  if (!report.valid) {
    ctx.addIssue({ code: 'custom', message: 'htmlvalidationerror', params: { value: report } });
  }
}

const NO_HTML_REGEX = /<.*?>/;
const NO_HTML_MESSAGE = '{{:#label}} failed custom validation because HTML is not allowed in this field';

const htmlNotAllowedSchema = z.string().refine((value) => !NO_HTML_REGEX.test(value), { message: NO_HTML_MESSAGE });

export { htmlNotAllowedSchema, htmlSchema, NO_HTML_MESSAGE, NO_HTML_REGEX, proposalIdSchema, uuidSchema };

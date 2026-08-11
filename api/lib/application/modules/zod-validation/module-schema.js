import { z } from 'zod';

import { audioElementSchema } from './element/audio-schema.js';
import { customDraftElementSchema } from './element/custom-draft-element-schema.js';
import { customElementSchema } from './element/custom-element-schema.js';
import { downloadElementSchema } from './element/download-schema.js';
import { embedElementSchema } from './element/embed-schema.js';
import { expandElementSchema } from './element/expand-schema.js';
import { flashcardsElementSchema } from './element/flashcards-schema.js';
import { imageElementSchema } from './element/image-schema.js';
import { qabElementSchema } from './element/qab-schema.js';
import { qcmDeclarativeElementSchema } from './element/qcm-declarative-schema.js';
import { qcmElementSchema } from './element/qcm-schema.js';
import { qcuDeclarativeElementSchema } from './element/qcu-declarative-schema.js';
import { qcuDiscoveryElementSchema } from './element/qcu-discovery-schema.js';
import { qcuElementSchema } from './element/qcu-schema.js';
import { qrocmElementSchema } from './element/qrocm-schema.js';
import { separatorElementSchema } from './element/separator-schema.js';
import { shortVideoElementSchema } from './element/short-video-schema.js';
import { textElementSchema } from './element/text-schema.js';
import { videoElementSchema } from './element/video-schema.js';
import { htmlNotAllowedSchema, htmlSchema, uuidSchema } from './utils.js';

const ELEMENTS_SCHEMA_BY_TYPE = {
  audio: audioElementSchema,
  custom: customElementSchema,
  'custom-draft': customDraftElementSchema,
  download: downloadElementSchema,
  embed: embedElementSchema,
  expand: expandElementSchema,
  flashcards: flashcardsElementSchema,
  image: imageElementSchema,
  qab: qabElementSchema,
  qcu: qcuElementSchema,
  'qcu-declarative': qcuDeclarativeElementSchema,
  'qcu-discovery': qcuDiscoveryElementSchema,
  qcm: qcmElementSchema,
  'qcm-declarative': qcmDeclarativeElementSchema,
  qrocm: qrocmElementSchema,
  separator: separatorElementSchema,
  'short-video': shortVideoElementSchema,
  text: textElementSchema,
  video: videoElementSchema,
};

const ELEMENTS_FORBIDDEN_IN_STEPPER = ['flashcards', 'qab'];

const moduleDetailsSchema = z.object({
  image: z
    .string()
    .url()
    .describe(
      'Image qui s’affiche dans l’en-tête du module. Exemple: https://assets.pix.org/modules/placeholder-details.svg.',
    ),
  description: htmlSchema.describe('Texte d’introduction en dessous du titre du module.'),
  duration: z
    .number()
    .int()
    .min(0)
    .max(120)
    .describe('Durée du module (en minutes). Valeur acceptée: entre 0 et 120. Ne pas inclure l’unité.'),
  level: z.enum([
    'novice',
    'independent',
    'advanced',
    'expert',
  ]).describe('Niveau du module.'),
  objectives: z
    .array(htmlSchema)
    .min(1)
    .describe('Un objectif minimum. Ils s’affichent dans l’ordre contribué.'),
  tabletSupport: z
    .enum([
      'comfortable',
      'inconvenient',
      'obstructed',
    ])
    .describe(
      "Si la valeur est inconvenient ou obstructed, on indiquera à l'utilisateur que le module peut être difficile à réaliser sur un petit écran.",
    ),
});

const elementSchema = z.union(Object.values(ELEMENTS_SCHEMA_BY_TYPE));

const stepperElementSchema = z.union(
  Object.entries(ELEMENTS_SCHEMA_BY_TYPE)
    .filter(([type]) => !ELEMENTS_FORBIDDEN_IN_STEPPER.includes(type))
    .map(([, schema]) => schema),
);

const componentElementSchema = z.object({
  type: z.literal('element'),
  element: elementSchema,
});

const componentStepperSchema = z.object({
  type: z.literal('stepper'),
  instruction: htmlSchema.describe("Instruction du stepper. S'affiche uniquement pour le stepper horizontal."),
  steps: z.array(z.object({ elements: z.array(stepperElementSchema) })).min(2),
});

const grainSchema = z.object({
  id: uuidSchema,
  type: z.enum([
    'short-lesson',
    'discovery',
    'activity',
    'challenge',
    'lesson',
    'summary',
    'transition',
  ]),
  title: htmlNotAllowedSchema.describe('Titre du grain. Usage interne pour faciliter la navigation sur Modulix Editor.'),
  components: z.array(z.union([componentElementSchema, componentStepperSchema])).superRefine((value, ctx) => {
    const steppersInArray = value.filter(({ type }) => type === 'stepper');
    if (steppersInArray.length > 1) {
      ctx.addIssue({ code: 'custom', message: "Il ne peut y avoir qu'un stepper par grain" });
    }

    const elementsInArray = value.filter(({ type }) => type === 'element');
    const containsAnswerableElement = elementsInArray.some(({ element }) =>
      [
        'qcu',
        'qcm',
        'qrocm',
      ].includes(element.type),
    );
    if (steppersInArray.length === 1 && containsAnswerableElement) {
      ctx.addIssue({
        code: 'custom',
        message:
          "Un grain ne peut pas être composé d'un composant 'stepper' et d'un composant 'element' répondable (QCU, QCM ou QROCM)",
      });
    }
  }),
});

const moduleSectionSchema = z.object({
  id: uuidSchema,
  type: z.enum([
    'question-yourself',
    'explore-to-understand',
    'retain-the-essentials',
    'practise',
    'go-further',
    'blank',
  ]),
  grains: z.array(grainSchema),
});

const moduleGlossaryEntrySchema = z.object({
  word: z.string(),
  definition: htmlSchema,
});

const moduleSchema = z.object({
  id: uuidSchema.describe('Identifiant universel unique (uuid) du module.'),
  shortId: z.string().length(8).describe("Identifiant court unique du module, présent dans l'url."),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .describe(
      "Identifiant texte unique du module, présent dans l'url. Caractères autorisés : Tout caractère entre a et z (minuscules), tout chiffre (0 à 9) et le trait d'union (-).",
    ),
  title: htmlNotAllowedSchema.describe('Titre du module.'),
  isBeta: z.boolean(),
  visibility: z
    .enum(['private', 'public'])
    .describe(
      'Valeurs acceptées : private, public. Si vous indiquez "public", le module pourra être sélectionné à la création d’un contenu formatif dans Pix Admin.',
    ),
  details: moduleDetailsSchema,
  sections: z.array(moduleSectionSchema),
  glossary: z
    .array(moduleGlossaryEntrySchema)
    .describe("Glossaire des mots nécessitant l'affichage de leurs définitions dans le module."),
});

export { componentStepperSchema, grainSchema, moduleSchema };

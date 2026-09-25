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
import { describe, exactLength, external, htmlNotAllowedSchema, htmlSchema, string, switchOn, uri, uuidSchema, withRequiredItem } from './utils.js';

const ALLOWED_ELEMENTS_SCHEMA = [
  { type: 'audio', schema: audioElementSchema },
  { type: 'custom', schema: customElementSchema },
  { type: 'custom-draft', schema: customDraftElementSchema },
  { type: 'download', schema: downloadElementSchema },
  { type: 'embed', schema: embedElementSchema },
  { type: 'expand', schema: expandElementSchema },
  { type: 'flashcards', schema: flashcardsElementSchema },
  { type: 'image', schema: imageElementSchema },
  { type: 'qab', schema: qabElementSchema },
  { type: 'qcu', schema: qcuElementSchema },
  { type: 'qcu-declarative', schema: qcuDeclarativeElementSchema },
  { type: 'qcu-discovery', schema: qcuDiscoveryElementSchema },
  { type: 'qcm', schema: qcmElementSchema },
  { type: 'qcm-declarative', schema: qcmDeclarativeElementSchema },
  { type: 'qrocm', schema: qrocmElementSchema },
  { type: 'separator', schema: separatorElementSchema },
  { type: 'short-video', schema: shortVideoElementSchema },
  { type: 'text', schema: textElementSchema },
  { type: 'video', schema: videoElementSchema },
];

const ELEMENTS_FORBIDDEN_IN_STEPPER = ['flashcards', 'qab'];

const ANSWERABLE_ELEMENT_TYPES = [
  'qcu',
  'qcm',
  'qrocm',
];

const moduleDetailsSchema = z.strictObject({
  image: describe(
    uri(),
    'Image qui s’affiche dans l’en-tête du module. Exemple: https://assets.pix.org/modules/placeholder-details.svg.',
  ),
  description: describe(htmlSchema(), 'Texte d’introduction en dessous du titre du module.'),
  duration: describe(
    z.int().min(0).max(120),
    'Durée du module (en minutes). Valeur acceptée: entre 0 et 120. Ne pas inclure l’unité.',
  ),
  level: describe(z.enum([
    'novice',
    'independent',
    'advanced',
    'expert',
  ]), 'Niveau du module.'),
  objectives: describe(
    z.array(htmlSchema()).min(1),
    'Un objectif minimum. Ils s’affichent dans l’ordre contribué.',
  ),
  tabletSupport: describe(
    z.enum([
      'comfortable',
      'inconvenient',
      'obstructed',
    ]),
    "Si la valeur est inconvenient ou obstructed, on indiquera à l'utilisateur que le module peut être difficile à réaliser sur un petit écran.",
  ),
});

const elementSchema = switchOn('type', ALLOWED_ELEMENTS_SCHEMA.map(({ schema }) => schema));

const stepperElementSchema = switchOn(
  'type',
  ALLOWED_ELEMENTS_SCHEMA
    .filter(({ type }) => !ELEMENTS_FORBIDDEN_IN_STEPPER.includes(type))
    .map(({ schema }) => schema),
);

const componentElementSchema = z.strictObject({
  type: z.enum(['element']),
  element: elementSchema,
}).meta({ title: 'element' });

const componentStepperSchema = z.strictObject({
  type: z.enum(['stepper']),
  instruction: describe(
    htmlSchema({ allowEmpty: true }),
    "Instruction du stepper. S'affiche uniquement pour le stepper horizontal.",
  ),
  steps: z.array(
    z.strictObject({ elements: z.array(stepperElementSchema) }),
  ).min(2),
}).meta({ title: 'stepper' });

const componentsSchema = external(
  external(
    z.array(switchOn('type', [componentElementSchema, componentStepperSchema])),
    (components) => {
      const steppersInArray = components.filter(({ type }) => type === 'stepper');
      if (steppersInArray.length > 1) {
        return "Il ne peut y avoir qu'un stepper par grain";
      }
    },
  ),
  (components) => {
    const steppersInArray = components.filter(({ type }) => type === 'stepper');
    const elementsInArray = components.filter(({ type }) => type === 'element');
    const containsAnswerableElement = elementsInArray.some(({ element }) => ANSWERABLE_ELEMENT_TYPES.includes(element.type));
    if (steppersInArray.length === 1 && containsAnswerableElement) {
      return "Un grain ne peut pas être composé d'un composant 'stepper' et d'un composant 'element' répondable (QCU, QCM ou QROCM)";
    }
  },
);

const grainSchema = z.strictObject({
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
  title: describe(
    htmlNotAllowedSchema({ allowEmpty: true }),
    'Titre du grain. Usage interne pour faciliter la navigation sur Modulix Editor.',
  ),
  components: componentsSchema.optional(),
});

const moduleSectionSchema = z.strictObject({
  id: uuidSchema,
  type: z.enum([
    'question-yourself',
    'explore-to-understand',
    'retain-the-essentials',
    'practise',
    'go-further',
    'blank',
  ]),
  grains: withRequiredItem(z.array(grainSchema)),
});

const moduleGlossaryEntrySchema = z.strictObject({
  word: string(),
  definition: htmlSchema(),
});

const moduleSchema = z.strictObject({
  id: describe(uuidSchema, 'Identifiant universel unique (uuid) du module.'),
  shortId: describe(exactLength(string(), 8), "Identifiant court unique du module, présent dans l'url."),
  slug: describe(
    string().regex(/^[a-z0-9-]+$/),
    "Identifiant texte unique du module, présent dans l'url. Caractères autorisés : Tout caractère entre a et z (minuscules), tout chiffre (0 à 9) et le trait d'union (-).",
  ),
  title: describe(htmlNotAllowedSchema(), 'Titre du module.'),
  isBeta: z.boolean(),
  visibility: describe(
    z.enum(['private', 'public']),
    'Valeurs acceptées : private, public. Si vous indiquez "public", le module pourra être sélectionné à la création d’un contenu formatif dans Pix Admin.',
  ),
  details: moduleDetailsSchema,
  sections: z.array(moduleSectionSchema),
  glossary: describe(
    z.array(moduleGlossaryEntrySchema),
    "Glossaire des mots nécessitant l'affichage de leurs définitions dans le module.",
  ),
});

export { componentStepperSchema, grainSchema, moduleSchema };

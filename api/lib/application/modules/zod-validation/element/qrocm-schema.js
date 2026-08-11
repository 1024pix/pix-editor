import { z } from 'zod';

import { htmlNotAllowedSchema, htmlSchema, proposalIdSchema, uuidSchema } from '../utils.js';
import { feedbackSchema } from './feedback-schema.js';

const blockInputSchema = z.object({
  input: htmlNotAllowedSchema.describe('Identifiant unique obligatoire (non visible dans le module)'),
  type: z.literal('input').describe("Le type input permet d'afficher un champ éditable par l'utilisateur."),
  inputType: z
    .enum(['text', 'number'])
    .describe(
      "Le type number affiche un champ qui n'accepte que les chiffres. Le type text affiche un champ textuel classique.",
    ),
  size: z
    .number()
    .positive()
    .describe('Largeur du champ. Indiquez une valeur correspondant au nombre de caractères attendu.'),
  display: z
    .enum(['inline', 'block'])
    .describe(
      "Type d'affichage du champ. En inline, le champ apparaîtra sur la même ligne que les autres propositions. En block, il se mettra à la ligne suivante.",
    ),
  placeholder: htmlNotAllowedSchema.describe("Texte de substitution qui s'affiche dans le champ avant qu'il soit édité."),
  ariaLabel: htmlNotAllowedSchema.describe(
    "Description du champ nécessaire à l’accessibilité (non visible dans le module, lu par les lecteurs d'écran).",
  ),
  tolerances: z
    .array(z.enum([
      't1',
      't2',
      't3',
    ]))
    .refine((values) => new Set(values).size === values.length, { message: 'tolerances must be unique' })
    .describe(
      "Les tolérances permettent de valider une réponse malgré les erreurs. (T1 - Espaces, casse & accents, T2 - Ponctuation et T3 - Distance d'édition).",
    ),
  solutions: z
    .array(
      z.union([z.string().min(1).describe('Contenu (type texte) de la solution.'), z.number().min(1).describe('Contenu (type nombre) de la solution.')]),
    )
    .describe('Solution(s) du champ.'),
});

const blockSelectSchema = z.object({
  type: z.literal('select').describe("Le type select permet d'afficher un sélecteur avec plusieurs options."),
  input: htmlNotAllowedSchema.describe('Identifiant unique obligatoire (non visible dans le module)'),
  display: z
    .enum(['inline', 'block'])
    .describe(
      "Type d'affichage du champ. En inline, le champ apparaîtra sur la même ligne que les autres propositions. En block, il se mettra à la ligne suivante.",
    ),
  placeholder: htmlNotAllowedSchema.describe(
    "Texte de substitution qui s'affiche dans le champ lorsqu’aucune option n'est sélectionnée.",
  ),
  ariaLabel: htmlNotAllowedSchema.describe(
    "Description du champ nécessaire à l’accessibilité (non visible dans le module, lu par les lecteurs d'écran).",
  ),
  // mirrors Joi's `.empty()`: tolerances only makes sense for QROCm blocks of type input
  tolerances: z.tuple([]).optional().describe('Les tolérances ne concernent que les QROCm de type input.'),
  options: z
    .array(
      z.object({
        id: proposalIdSchema.optional().describe("Identifiant de l'option. Caractères autorisés : tout chiffre (0 à 9)."),
        content: htmlNotAllowedSchema.describe("Contenu de l'option."),
      }),
    )
    .describe('Options du champ.'),
  solutions: z
    .array(proposalIdSchema.describe("Coller ici l'dentifiant (id) de l'option"))
    .describe('Solution(s) du champ.'),
});

const blockTextSchema = z.object({
  type: z.literal('text'),
  content: htmlSchema.optional(),
});

const qrocmElementSchema = z.object({
  id: uuidSchema,
  type: z.literal('qrocm'),
  instruction: htmlSchema.describe('Consigne du QROCm'),
  proposals: z
    .array(z.union([
      blockTextSchema,
      blockInputSchema,
      blockSelectSchema,
    ]))
    .describe(
      'Propositions qui vont s’afficher les unes à la suite des autres dans le module (dans l’ordre de contribution)',
    ),
  feedbacks: z.object({
    valid: feedbackSchema.optional(),
    invalid: feedbackSchema.optional(),
  }),
});

export { blockInputSchema, blockSelectSchema, qrocmElementSchema };

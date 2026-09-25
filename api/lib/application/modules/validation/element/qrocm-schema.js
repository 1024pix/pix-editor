import { z } from 'zod';

import { alternatives, describe, htmlNotAllowedSchema, htmlSchema, proposalIdSchema, string, switchOn, unique, uuidSchema } from '../utils.js';
import { feedbackSchema } from './feedback-schema.js';

export const blockInputSchema = z.strictObject({
  input: describe(htmlNotAllowedSchema(), 'Identifiant unique obligatoire (non visible dans le module)'),
  type: describe(z.enum(['input']), "Le type input permet d'afficher un champ éditable par l'utilisateur."),
  inputType: describe(
    z.enum(['text', 'number']),
    "Le type number affiche un champ qui n'accepte que les chiffres. Le type text affiche un champ textuel classique.",
  ),
  size: describe(
    z.number().positive(),
    'Largeur du champ. Indiquez une valeur correspondant au nombre de caractères attendu.',
  ),
  display: describe(
    z.enum(['inline', 'block']),
    "Type d'affichage du champ. En inline, le champ apparaîtra sur la même ligne que les autres propositions. En block, il se mettra à la ligne suivante.",
  ),
  placeholder: describe(
    htmlNotAllowedSchema({ allowEmpty: true }),
    "Texte de substitution qui s'affiche dans le champ avant qu'il soit édité.",
  ),
  ariaLabel: describe(
    htmlNotAllowedSchema(),
    "Description du champ nécessaire à l’accessibilité (non visible dans le module, lu par les lecteurs d'écran).",
  ),
  tolerances: describe(
    unique(z.array(z.enum([
      't1',
      't2',
      't3',
    ]))),
    "Les tolérances permettent de valider une réponse malgré les erreurs. (T1 - Espaces, casse & accents, T2 - Ponctuation et T3 - Distance d'édition).",
  ),
  solutions: describe(
    z.array(
      alternatives([describe(string().min(1), 'Contenu (type texte) de la solution.'), describe(z.number().min(1), 'Contenu (type nombre) de la solution.')]),
    ),
    'Solution(s) du champ.',
  ),
}).meta({ title: 'input' });

export const blockSelectSchema = z.strictObject({
  type: describe(z.enum(['select']), "Le type select permet d'afficher un sélecteur avec plusieurs options."),
  input: describe(htmlNotAllowedSchema(), 'Identifiant unique obligatoire (non visible dans le module)'),
  display: describe(
    z.enum(['inline', 'block']),
    "Type d'affichage du champ. En inline, le champ apparaîtra sur la même ligne que les autres propositions. En block, il se mettra à la ligne suivante.",
  ),
  placeholder: describe(
    htmlNotAllowedSchema({ allowEmpty: true }).meta({ default: '- Sélectionner -' }),
    "Texte de substitution qui s'affiche dans le champ lorsqu’aucune option n'est sélectionnée.",
  ),
  ariaLabel: describe(
    htmlNotAllowedSchema(),
    "Description du champ nécessaire à l’accessibilité (non visible dans le module, lu par les lecteurs d'écran).",
  ),
  tolerances: describe(z.array(z.any()), 'Les tolérances ne concernent que les QROCm de type input.'),
  options: describe(
    z.array(
      z.strictObject({
        id: describe(proposalIdSchema(), "Identifiant de l'option. Caractères autorisés : tout chiffre (0 à 9).").optional(),
        content: describe(htmlNotAllowedSchema(), "Contenu de l'option."),
      }),
    ),
    'Options du champ.',
  ),
  solutions: describe(
    z.array(describe(proposalIdSchema(), "Coller ici l'dentifiant (id) de l'option")),
    'Solution(s) du champ.',
  ),
}).meta({ title: 'select' });

const blockTextSchema = z.strictObject({
  type: z.enum(['text']),
  content: htmlSchema().optional(),
}).meta({ title: 'text' });

export const qrocmElementSchema = z.strictObject({
  id: uuidSchema,
  type: z.enum(['qrocm']),
  instruction: describe(htmlSchema(), 'Consigne du QROCm'),
  proposals: describe(
    unique(
      z.array(switchOn('type', [
        blockTextSchema,
        blockInputSchema,
        blockSelectSchema,
      ])),
      (a, b) => a.input && b.input && a.input === b.input,
    ),
    'Propositions qui vont s’afficher les unes à la suite des autres dans le module (dans l’ordre de contribution)',
  ),
  feedbacks: z.strictObject({
    valid: feedbackSchema.optional(),
    invalid: feedbackSchema.optional(),
  }),
}).meta({ title: 'qrocm' });

import { propsExamples } from '@1024pix/epreuves-components/props.examples';
import { schema as customElementsPropsSchemas } from '@1024pix/epreuves-components/schema';

const TAG_NAMES_BY_EXAMPLE = { 'clickable-image-without-spot': 'clickable-image' };

// A valid module using every element type, used to compare Joi and Zod module schemas
export function buildFullModule() {
  let uuidIndex = 0;
  const uuid = () => `00000000-0000-4000-8000-${String(++uuidIndex).padStart(12, '0')}`;

  const elements = [
    { id: uuid(), type: 'audio', title: 'Un audio', url: 'https://assets.pix.org/modules/placeholder-audio.mp3', transcription: '<p>Audio manquant</p>' },
    ...Object.entries(propsExamples)
      .map(([example, props]) => ({ tagName: TAG_NAMES_BY_EXAMPLE[example] ?? example, props }))
      .filter(({ tagName }) => customElementsPropsSchemas[tagName])
      .map(({ tagName, props }) => ({ id: uuid(), type: 'custom', title: 'Un POI', instruction: '<p>Consigne</p>', functionalInstruction: '', tagName, props })),
    { id: uuid(), type: 'custom-draft', title: 'Echange de mails', url: 'https://1024pix.github.io/pixmail-alert_avast_b.html', instruction: '<p>Vous participez à un échange de mail.</p>', height: 400 },
    { id: uuid(), type: 'download', files: [{ url: 'https://assets.pix.org/modules/placeholder-image.svg', format: '.svg' }] },
    { id: uuid(), type: 'embed', isCompletionRequired: true, title: 'Simulateur', url: 'https://epreuves.pix.fr/visio/visio.html?mode=modulix-didacticiel', instruction: '<p>Vous participez.</p>', solution: 'toto', height: 600 },
    { id: uuid(), type: 'expand', title: 'Un expand', content: '<p>Contenu</p>' },
    {
      id: uuid(),
      type: 'flashcards',
      title: "Introduction à l'adresse e-mail",
      instruction: '<p>...</p>',
      introImage: { url: 'https://example.org/image.jpeg' },
      cards: [{ id: uuid(), recto: { image: { url: 'https://example.org/image.jpeg' }, text: 'Question ?' }, verso: { image: { url: '' }, text: '<p>Réponse</p>' } }],
    },
    { id: uuid(), type: 'image', url: 'https://assets.pix.org/modules/placeholder-image.svg', alt: '', alternativeText: '', legend: 'Légende', licence: 'CC' },
    {
      id: uuid(),
      type: 'qab',
      instruction: '<p>Entraînez-vous</p>',
      cards: [{ id: uuid(), image: { url: 'https://assets.pix.org/modules/boules.jpg', altText: 'Des boules' }, text: 'Les boules sont creuses ?', proposalA: 'Vrai', proposalB: 'Faux', solution: 'A' }, { id: uuid(), text: 'Les chiens ne transpirent pas.', proposalA: 'Vrai', proposalB: 'Faux', solution: 'B' }],
      feedback: { diagnosis: '<p>Continuez comme ça !</p>' },
    },
    {
      id: uuid(),
      type: 'qcu',
      instruction: '<p>Une question à choix unique ?</p>',
      proposals: [1, 2].map((i) => ({ id: `${i}`, content: `Proposition ${i}`, feedback: { state: 'Correct !', diagnosis: `<p>${i}</p>` } })),
      solution: '1',
      hasShortProposals: false,
    },
    {
      id: uuid(),
      type: 'qcu',
      instruction: '<p>Une question à réponses courtes ?</p>',
      proposals: [1, 2].map((i) => ({ id: `${i}`, content: `Court ${i}`, feedback: { state: '', diagnosis: `<p>${i}</p>` } })),
      solution: '2',
      hasShortProposals: true,
    },
    {
      id: uuid(),
      type: 'qcu-declarative',
      instruction: '<p>Une question déclarative ?</p>',
      proposals: [1, 2].map((i) => ({ id: `${i}`, content: `Proposition ${i}`, feedback: { diagnosis: `<p>${i}</p>` } })),
      hasShortProposals: false,
    },
    {
      id: uuid(),
      type: 'qcu-discovery',
      instruction: '<p>Une question découverte ?</p>',
      proposals: [1, 2].map((i) => ({ id: `${i}`, content: `Proposition ${i}`, feedback: { diagnosis: `<p>${i}</p>` } })),
      solution: '1',
      hasShortProposals: false,
    },
    {
      id: uuid(),
      type: 'qcm',
      instruction: '<p>Une question à choix multiples ?</p>',
      proposals: [
        1,
        2,
        3,
      ].map((i) => ({ id: `${i}`, content: `Proposition ${i}` })),
      feedbacks: { valid: { state: 'Correct !', diagnosis: '<p>Bien</p>' }, invalid: { state: 'Incorrect !', diagnosis: '' } },
      solutions: ['1', '2'],
      hasShortProposals: false,
    },
    {
      id: uuid(),
      type: 'qcm-declarative',
      instruction: '<p>Une question déclarative multiple ?</p>',
      proposals: [
        1,
        2,
        3,
      ].map((i) => ({ id: `${i}`, content: `Proposition ${i}` })),
      feedback: { diagnosis: '<p>Un diagnostic</p>' },
      hasShortProposals: false,
    },
    {
      id: uuid(),
      type: 'qrocm',
      instruction: '<p>Complétez le texte ci-dessous.</p>',
      proposals: [
        { type: 'text', content: '<p>Un texte&nbsp;:</p>' },
        { input: 'symbole', type: 'input', inputType: 'text', size: 1, display: 'inline', placeholder: '', ariaLabel: 'Remplir', tolerances: ['t1', 't2'], solutions: ['@', 1] },
        { input: 'modulix', type: 'select', display: 'block', placeholder: '', ariaLabel: 'Choisir', tolerances: [], options: [{ id: '1', content: 'Génial' }, { id: '2', content: 'Incroyable' }], solutions: ['2'] },
      ],
      feedbacks: { valid: { state: 'Correct', diagnosis: '<p>Bien</p>' }, invalid: { state: 'Incorrect !', diagnosis: '<p>Dommage</p>' } },
    },
    { id: uuid(), type: 'separator' },
    { id: uuid(), type: 'short-video', title: 'Une vidéo courte', url: 'https://assets.pix.org/modules/placeholder-video.mp4', transcription: 'Je clique.' },
    { id: uuid(), type: 'text', tag: ' ', content: "<p>Ceci est un texte qui accepte de l'HTML.</p>" },
    { id: uuid(), type: 'video', title: 'Une vidéo', url: 'https://assets.pix.org/modules/placeholder-video.mp4', poster: 'https://assets.pix.org/modules/poster.jpg', subtitles: '', transcription: '<p>Vidéo manquante</p>' },
  ];

  return {
    id: uuid(),
    shortId: 'gle9d3fz',
    slug: 'bac-a-sable',
    title: 'Bac à sable',
    isBeta: true,
    visibility: 'public',
    details: {
      image: 'https://assets.pix.org/modules/placeholder-details.svg',
      description: '<p>Découvrez Modulix !</p>',
      duration: 5,
      level: 'novice',
      tabletSupport: 'comfortable',
      objectives: ['Naviguer dans Modulix'],
    },
    sections: [
      {
        id: uuid(),
        type: 'blank',
        grains: [
          {
            id: uuid(),
            type: 'lesson',
            title: 'Tous les éléments',
            components: elements.map((element) => ({ type: 'element', element })),
          },
          {
            id: uuid(),
            type: 'discovery',
            title: '',
            components: [
              {
                type: 'stepper',
                instruction: '',
                steps: [{ elements: [{ id: uuid(), type: 'text', tag: 'tip', content: '<p>Étape 1</p>' }] }, { elements: [{ id: uuid(), type: 'image', url: 'https://assets.pix.org/modules/placeholder-image.svg', alt: 'Une image' }] }],
              },
            ],
          },
        ],
      },
    ],
    glossary: [{ word: 'Modulix', definition: '<p>Un outil</p>' }],
  };
}

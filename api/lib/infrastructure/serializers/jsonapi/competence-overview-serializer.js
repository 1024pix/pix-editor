import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

export function serialize(competenceOverview) {
  return new Serializer('competence-overview', {
    ref: 'id',
    attributes: [
      'airtableId',
      'name',
      'locale',
      'thematicOverviews',
    ],
    typeForAttribute: (attr) => {
      if (attr === 'thematicOverviews') return 'thematic-overviews';
      if (attr === 'tubeOverviews') return 'tube-overviews';
      if (attr === 'atelierSkillViews') return 'atelier-skill-views';
      if (attr === 'atelierSkillVersionViews') return 'atelier-skill-version-views';
      if (attr === 'enConstructionSkillViews') return 'en-construction-skill-views';
      if (attr === 'enProductionSkillViews') return 'en-production-skill-views';
      return undefined;
    },
    thematicOverviews:  {
      include: true,
      ref: 'id',
      attributes: [
        'airtableId',
        'name',
        'tubeOverviews',
      ],
      tubeOverviews: {
        include: true,
        ref: 'id',
        attributes: [
          'airtableId',
          'name',
          'enConstructionSkillViews',
          'enProductionSkillViews',
          'atelierSkillViews',
        ],
        enConstructionSkillViews: {
          include: true,
          ref: 'id',
          attributes: [
            'airtableId',
            'name',
            'level',
            'hint',
            'hintStatus',
            'tutorialsCount',
            'learningMoreTutorialsCount',
          ],
        },
        enProductionSkillViews: {
          include: true,
          ref: 'id',
          attributes: [
            'airtableId',
            'name',
            'level',
            'status',
            'hint',
            'hintStatus',
            'prototypeId',
            'isProtoDeclinable',
            'validatedChallengesCount',
            'proposedChallengesCount',
            'tutorialsCount',
            'learningMoreTutorialsCount',
          ],
        },
        atelierSkillViews: {
          include: true,
          ref: 'id',
          attributes: [
            'name',
            'level',
            'validatedPrototypesCount',
            'proposedPrototypesCount',
            'archivedPrototypesCount',
            'obsoletePrototypesCount',
            'atelierSkillVersionViews',
          ],
          atelierSkillVersionViews: {
            include: true,
            ref: 'id',
            attributes: [
              'airtableId',
              'status',
            ],
          }
        },
      }
    }
  }).serialize(competenceOverview);
}

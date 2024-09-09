import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = JsonapiSerializer;

export function serialize(competenceOverview) {
  return new Serializer('competence-overview', {
    ref: 'id',
    attributes: [
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
        'name',
        'tubeOverviews',
      ],
      tubeOverviews: {
        include: true,
        ref: 'id',
        attributes: [
          'name',
          'enConstructionSkillViews',
          'enProductionSkillViews',
          'atelierSkillViews',
        ],
        enConstructionSkillViews: {
          include: true,
          ref: 'id',
          attributes: [
            'name',
            'level',
            'hintStatus',
            'tutorialsCount',
            'learningMoreTutorialsCount',
          ],
        },
        enProductionSkillViews: {
          include: true,
          ref: 'id',
          attributes: [
            'name',
            'level',
            'status',
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
            'atelierSkillVersionViews',
          ],
          atelierSkillVersionViews: {
            include: true,
            ref: 'id',
            attributes: [
              'status',
              'validatedPrototypesCount',
              'proposedPrototypesCount',
              'archivedPrototypesCount',
              'obsoletePrototypesCount',
            ],
          }
        },
      }
    }
  }).serialize(competenceOverview);
}

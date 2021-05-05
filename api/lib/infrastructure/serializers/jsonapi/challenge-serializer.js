const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(challenge) {
    return new Serializer('challenges', {
      attributes: [
        'airtableId',
        'instruction',
        'alternativeInstruction',
        'type',
        'format',
        'proposals',
        'solution',
        'solutionToDisplay',
        't1Status',
        't2Status',
        't3Status',
        'pedagogy',
        'author',
        'declinable',
        'version',
        'genealogy',
        'status',
        'preview',
        'scoring',
        'timer',
        'embedUrl',
        'embedTitle',
        'embedHeight',
        'alternativeVersion',
        'accessibility1',
        'accessibility2',
        'spoil',
        'responsive',
        'locales',
        'area',
        'autoReply',
        'focusable',
      ],
    }).serialize(challenge);
  }
};

const { Serializer, Deserializer } = require('jsonapi-serializer');

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
        'skills',
        'files',
        'updatedAt',
      ],
      typeForAttribute(attribute) {
        if (attribute === 'files') return 'attachments';
      },
      skills: {
        ref(challenge, skillId) {
          return skillId;
        }
      },
      files: {
        ref(challenge, fileId) {
          return fileId;
        }
      }
    }).serialize(challenge);
  },

  deserialize(challenge) {
    return new Promise((resolve, reject) => {
      new Deserializer({
        keyForAttribute: 'camelCase',
        skills: {
          valueForRelationship(skill) {
            return skill.id;
          },
        },
        attachments: {
          valueForRelationship(attachment) {
            return attachment.id;
          },
        },
      }).deserialize(challenge, (err, challenges) => {
        return err ? reject(err) : resolve(challenges);
      });
    });
  },

};

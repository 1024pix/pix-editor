import JsonapiSerializer from 'jsonapi-serializer';

const { Serializer, Deserializer } = JsonapiSerializer;

const serializer = new Serializer('challenges', {
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
    'skill',
    'files',
    'updatedAt',
    'validatedAt',
    'archivedAt',
    'madeObsoleteAt',
    'shuffled',
  ],
  typeForAttribute(attribute) {
    if (attribute === 'files') return 'attachments';
  },
  skill: {
    ref(challenge, skillId) {
      return skillId;
    }
  },
  files: {
    ref(challenge, fileId) {
      return fileId;
    }
  },
  transform(challenge) {
    challenge.skill = challenge.skills[0];
    return challenge;
  }
});

export function serialize(challenge) {
  return serializer.serialize(challenge);
}

const deserializer = new Deserializer({
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
  transform(challenge) {
    challenge.skills = challenge.skill ? [challenge.skill] : [];
    delete challenge.skill;
    return challenge;
  }
});

export function deserialize(challenge) {
  return new Promise((resolve, reject) => {
    deserializer.deserialize(challenge, (err, challenges) => {
      return err ? reject(err) : resolve(challenges);
    });
  });
}

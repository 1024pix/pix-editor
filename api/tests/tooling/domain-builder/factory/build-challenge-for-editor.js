const ChallengeForEditor = require('../../../../lib/domain/models/ChallengeForEditor');

const buildChallengeForEditor = function({
  airtableId = 'challengeAirtableId',
  id = 'challengeId',
  genealogy = 'Prototype 1',
  status = 'validé',
  version = 1,
} = {}) {
  return new ChallengeForEditor({
    airtableId,
    id,
    genealogy,
    status,
    version,
  });
};

buildChallengeForEditor.prototype = function({
  airtableId,
  id,
  version,
  status,
} = {}) {
  return buildChallengeForEditor({
    airtableId,
    id,
    genealogy: 'Prototype 1',
    status,
    version,
  });
};

buildChallengeForEditor.validatedPrototype = function({
  airtableId,
  id,
  version,
} = {}) {
  return buildChallengeForEditor.prototype({
    airtableId,
    id,
    status: 'validé',
    version,
  });
};

buildChallengeForEditor.draftPrototype = function({
  airtableId,
  id,
  version,
} = {}) {
  return buildChallengeForEditor.prototype({
    airtableId,
    id,
    status: 'proposé',
    version,
  });
};

buildChallengeForEditor.archivedPrototype = function({
  airtableId,
  id,
  version,
} = {}) {
  return buildChallengeForEditor.prototype({
    airtableId,
    id,
    status: 'archivé',
    version,
  });
};

buildChallengeForEditor.outdatedPrototype = function({
  airtableId,
  id,
  version,
} = {}) {
  return buildChallengeForEditor.prototype({
    airtableId,
    id,
    status: 'périmé',
    version,
  });
};

buildChallengeForEditor.alternative = function({
  airtableId,
  id,
  version,
  status,
} = {}) {
  return buildChallengeForEditor({
    airtableId,
    id,
    genealogy: 'Décliné 1',
    status,
    version,
  });
};

buildChallengeForEditor.validatedAlternative = function({
  airtableId,
  id,
  version,
} = {}) {
  return buildChallengeForEditor.alternative({
    airtableId,
    id,
    status: 'validé',
    version,
  });
};

buildChallengeForEditor.draftAlternative = function({
  airtableId,
  id,
  version,
} = {}) {
  return buildChallengeForEditor.alternative({
    airtableId,
    id,
    status: 'proposé',
    version,
  });
};

buildChallengeForEditor.archivedAlternative = function({
  airtableId,
  id,
  version,
} = {}) {
  return buildChallengeForEditor.alternative({
    airtableId,
    id,
    status: 'archivé',
    version,
  });
};

buildChallengeForEditor.outdatedAlternative = function({
  airtableId,
  id,
  version,
} = {}) {
  return buildChallengeForEditor.alternative({
    airtableId,
    id,
    status: 'périmé',
    version,
  });
};

module.exports = buildChallengeForEditor;

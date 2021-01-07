const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(config) {
    return new Serializer('config', {
      attributes: [
        'airtableUrl',
        'tableChallenges',
        'tableSkills',
        'tableTubes',
        'storagePost',
        'storageTenant',
        'storageUser',
        'storagePassword',
        'storageKey',
        'storageAuth',
      ],
    }).serialize(config);
  }
};

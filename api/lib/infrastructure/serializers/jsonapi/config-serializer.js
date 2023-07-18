const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(config) {
    return new Serializer('config', {
      attributes: [
        'airtableUrl',
        'airtableBase',
        'tableChallenges',
        'tableSkills',
        'tableTubes',
        'storagePost',
        'storageTenant',
        'storageUser',
        'storagePassword',
        'storageKey',
        'storageAuth',
        'storageBucket',
        'localeToLanguageMap',
        'newPreview',
      ],
    }).serialize(config);
  }
};

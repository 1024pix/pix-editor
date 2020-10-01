const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(config) {
    return new Serializer('config', {
      attributes: [
        'airtableBase',
        'airtableEditorBase',
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
        'pixStaging',
        'airtableApiKey',
        'pixAdminUserEmail',
        'pixAdminUserPassword',
      ],
    }).serialize(config);
  }
};

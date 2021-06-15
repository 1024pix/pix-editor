const axios = require('axios');
const pLimit = require('p-limit');
const limit = pLimit(300);
const getToken = require('../common/token');

module.exports = {
  setHeadersToAttachments,
};

function main() {
  const backupBaseFolder = process.env.BACKUP_BASE_FOLDER;
  const attachments = require(backupBaseFolder + 'Attachments.json');
  setHeadersToAttachments(attachments);
}

async function setHeadersToAttachments(attachments) {
  const token = await getToken();
  let count = 0;

  const promises = attachments.map(async (attachment) => {
    const config = {
      headers: {
        'Content-Type': attachment.fields.mimeType,
        'X-Auth-Token': token,
      }
    };
    if (attachment.fields.type === 'attachment') {
      config.headers['Content-Disposition'] = `attachment; filename="${encodeURIComponent(attachment.fields.filename)}"`;
    }
    try {
      await limit(() => {
        count ++;
        console.log(`Progress: ${count / attachments.length * 100}`);
        return axios.post(attachment.fields.url, {}, config)
      });
    } catch (error) {
      console.error(error, `Error while setting headers of file ${attachment.fields.filename}`);
    }
  });
  await Promise.all(promises);
}

if (process.env.NODE_ENV !== 'test') {
  main();
}

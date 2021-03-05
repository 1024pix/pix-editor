const axios = require('axios');
const pLimit = require('p-limit');
const limit = pLimit(300);

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

async function getToken() {
  const data = {
    'auth': {
      'identity': {
        'methods': ['password'],
        'password': {
          'user': {
            'name': process.env.BUCKET_USER,
            'domain': { 'id': 'default' },
            'password': process.env.BUCKET_PASSWORD,
          }
        }
      },
      'scope': {
        'project': {
          'name': process.env.BUCKET_NAME,
          'domain': { 'id': 'default' }
        }
      }
    }
  };

  const response = await axios.post(process.env.TOKEN_URL, JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });

  return response.headers['x-subject-token'];
}

if (process.env.NODE_ENV !== 'test') {
  main();
}

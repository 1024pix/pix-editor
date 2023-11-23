import _ from 'lodash';
import axios from 'axios';
import { hash } from 'hasha';
import pLimit from 'p-limit';
import { readJSONFile } from '../common/read-json-file.js';
const limit = pLimit(300);

async function main() {
  const backupBaseFolder = process.env.BACKUP_BASE_FOLDER;
  const challenges = readJSONFile(backupBaseFolder, 'Epreuves.json');
  const attachments = readJSONFile(backupBaseFolder, 'Attachments.json');
  let challengeCount = 0;
  const promises = challenges.map(async (challenge) => {
    await limit(async () => {
      const errors = await checkChallengeAttachments(challenge, attachments, remoteChecksumComputer);
      if (_.isEmpty(errors)) {
        challengeCount ++;
        console.log(challengeCount / challenges.length * 100 + '%');
      } else {
        console.error(`Found inconsistent challenge and attachments: challenge ${challenge.id} should have these attachments ${JSON.stringify(errors)}`);
      }
    });
  });
  await Promise.all(promises);
}

export async function checkChallengeAttachments(challenge, attachments, remoteChecksumComputer) {
  const challengeAttachments = attachments.filter(({ fields }) => {
    const challengeId = fields.challengeId;
    return challengeId && challengeId[0] === challenge.fields['Record ID'];
  }).map(formatChallengeAttachment);
  const expectedFiles = challengeAttachmentsToFiles(challenge);

  for (const file of expectedFiles) {
    file.checksum = await remoteChecksumComputer(file.url);
    delete file.url;
  }

  for (const challengeAttachment of challengeAttachments) {
    challengeAttachment.checksum = await remoteChecksumComputer(challengeAttachment.url);
    delete challengeAttachment.url;
  }

  return _.differenceWith(expectedFiles, challengeAttachments, _.isEqual);
}

function formatChallengeAttachment(attachment) {
  return {
    filename: attachment.fields.filename,
    size: attachment.fields.size,
    alt: attachment.fields.alt || '',
    mimeType: attachment.fields.mimeType,
    type: attachment.fields.type,
    url: attachment.fields.url
  };
}

function challengeAttachmentsToFiles(challenge) {
  const { fields } = challenge;
  const files = [];

  const illustrations = fields['Illustration de la consigne'];
  if (illustrations) {
    const [illustration] = illustrations;
    files.push({
      filename: illustration.filename,
      size: illustration.size,
      alt: sanitizeAltText(fields['Texte alternatif illustration']),
      mimeType: illustration.type,
      type: 'illustration',
      url: illustration.url,
    });
  }

  const attachments = fields['Pièce jointe'];
  if (attachments) {
    attachments.forEach((attachment) => {
      files.push({
        filename: attachment.filename,
        size: attachment.size,
        alt: '',
        mimeType: attachment.type,
        type: 'attachment',
        url: attachment.url,
      });
    });
  }
  return files;
}

function sanitizeAltText(text) {
  if (text) {
    return text.replace(/ \n/gm, '\n');
  }
  return '';
}

async function remoteChecksumComputer(url) {

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  return hash(response.data.pipe, { algorithm: 'sha1' });
}

if (process.env.NODE_ENV !== 'test') {
  main();
}


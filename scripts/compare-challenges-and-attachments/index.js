const _ = require('lodash');
const fs = require('fs');
const path = require('path');

module.exports = {
  checkChallengeAttachments,
}

function main() {
  const backupBaseFolder = process.env.BACKUP_BASE_FOLDER;
  const challenges = require(backupBaseFolder + 'Epreuves.json');
  const attachments = require(backupBaseFolder + 'Attachments.json');
  let challengeCount = 0;
  challenges.forEach((challenge) => {
    const errors = checkChallengeAttachments(challenge, attachments);
    if (_.isEmpty(errors)) {
      challengeCount ++;
      // console.log(`Challenge ${challenge.id} is ok`);
    } else {
      console.error(`Found inconsistent challenge and attachments: challenge ${challenge.id} should have these attachments ${JSON.stringify(errors)}`)
    }
  });
  console.log(challengeCount)
}

function checkChallengeAttachments(challenge, attachments) {
  const challengeAttachments = attachments.filter(({ fields }) => {
    const challengeId = fields.challengeId;
    return challengeId && challengeId[0] === challenge.fields['Record ID']
  }).map(formatChallengeAttachment);
  const expectedFiles = challengeAttachmentsToFiles(challenge);
  return _.differenceWith(expectedFiles, challengeAttachments, _.isEqual);
}

function formatChallengeAttachment(attachment) {
  return {
    filename: attachment.fields.filename,
    size: attachment.fields.size,
    alt: attachment.fields.alt || '',
    url: attachment.fields.url,
    mimeType: attachment.fields.mimeType,
    type: attachment.fields.type,
  }
}

function challengeAttachmentsToFiles(challenge) {
  const { fields } = challenge;
  const id = fields['Record ID'];
  const files = [];

  const illustrations = fields['Illustration de la consigne'];
  if (illustrations) {
    const [illustration] = illustrations;
    files.push({
      filename: illustration.filename,
      size: illustration.size,
      alt: sanitizeAltText(fields['Texte alternatif illustration']),
      url: illustration.url,
      mimeType: illustration.type,
      type: 'illustration',
    });
  }

  const attachments = fields['Pièce jointe'];
  if (attachments) {
    attachments.forEach((attachment) => {
      files.push({
        filename: attachment.filename,
        size: attachment.size,
        alt: '',
        url: attachment.url,
        mimeType: attachment.type,
        type: 'attachment',
      });
    });
  }
  return files;
}

function sanitizeAltText(text) {
  if (text) {
    return text.replace(/ \n/gm, '\n')
  }
  return ''
}

if (process.env.NODE_ENV !== 'test') {
  main();
}


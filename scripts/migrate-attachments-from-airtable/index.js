import fs from 'fs';
import path from 'path';
import { readJSONFile } from '../common/read-json-file.js';

export function main() {
  const backupBaseFolder = process.env.BACKUP_BASE_FOLDER;
  const challenges = readJSONFile(backupBaseFolder, 'Epreuves.json');
  const csv = challengesAttachmentsToCsv(challenges, { bucketBaseUrl: process.env.BUCKET_BASE_URL });
  if (process.argv.includes('--rename-files')) {
    renameChallengesAttachments(challenges, backupBaseFolder);
  }
  fs.writeFileSync(backupBaseFolder + 'challenges.csv', csv);
}

export function challengesAttachmentsToCsv(challenges, { bucketBaseUrl }) {
  const headers = 'id,filename,size,alt,url,mimeType,type,challengeId';
  const lines = challenges.map((challenge) => challengeAttachmentsToCsv(challenge, { bucketBaseUrl })).filter((line) => line !== '');
  return headers + '\n' + lines.join('\n');
}

function renameChallengesAttachments(challenges, backupBaseFolder) {
  const folder = backupBaseFolder + 'attachments/';
  challenges.forEach((challenge) => renameFileToImport(challenge, (oldFilename, newFilename) => fs.copyFileSync(folder + oldFilename, folder + newFilename)));
}

export function challengeAttachmentsToCsv(challenge, { bucketBaseUrl }) {
  const { fields } = challenge;
  const id = fields['Record ID'];
  const csv = [];

  const illustrations = fields['Illustration de la consigne'];
  if (illustrations) {
    const [illustration] = illustrations;
    const url = attachmentUrl({
      challengeId: id,
      filename: illustration.filename,
      type: 'illustration',
      bucketBaseUrl,
    });
    pushToCsv(csv, [
      illustration.id,
      illustration.filename,
      illustration.size,
      fields['Texte alternatif illustration'] || '',
      url,
      illustration.type,
      'illustration',
      id,
    ]);
  }

  const attachments = fields['Pièce jointe'];
  if (attachments) {
    attachments.forEach((attachment) => {
      const url = attachmentUrl({
        challengeId: id,
        filename: attachment.filename,
        type: 'attachment',
        bucketBaseUrl,
      });
      pushToCsv(csv, [
        attachment.id,
        attachment.filename,
        attachment.size,
        '',
        url,
        attachment.type,
        'attachment',
        id,
      ]);
    });
  }
  return csv.join('\n');
}

export function attachmentUrl({ challengeId, filename, type, bucketBaseUrl }) {
  const encodedFilename = encodeURIComponent(newFilename({ challengeId, filename, type }));
  return `${bucketBaseUrl}${encodedFilename}`;
}

function newFilename({ challengeId, filename, type }) {
  return `${challengeId}_${type}_${filename}`;
}

function pushToCsv(csv, fields) {
  return csv.push(fields.map((v) => `"${escapeField(`${v}`)}"`).join(','));
}

function escapeField(field) {
  if (!field) {
    return '';
  }
  return field.replace(/"/g, '""');
}

export function renameFileToImport(challenge, renameFile) {
  const { fields } = challenge;
  const challengeId = fields['Record ID'];

  const illustrations = fields['Illustration de la consigne'];
  if (illustrations) {
    const [illustration] = illustrations;
    const oldFilename = `${illustration.id}${path.extname(illustration.filename)}`;
    const filename = newFilename({ challengeId, filename: illustration.filename, type: 'illustration' });
    renameFile(oldFilename, filename);
  }

  const attachments = fields['Pièce jointe'];
  if (attachments) {
    attachments.forEach((attachment) => {
      const oldFilename = `${attachment.id}${path.extname(attachment.filename)}`;
      const filename = newFilename({ challengeId, filename: attachment.filename, type: 'attachment' });
      renameFile(oldFilename, filename);
    });
  }
}

if (process.env.NODE_ENV !== 'test') {
  main();
}

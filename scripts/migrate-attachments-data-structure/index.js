const fs = require('fs');
const path = require('path');

module.exports = {
  main,
  challengeAttachmentsToCsv,
  challengesAttachmentsToCsv,
  renameFileToImport,
}

function main() {
  const backupBaseFolder = process.env.BACKUP_BASE_FOLDER;
  const challenges = require(backupBaseFolder + 'Epreuves.json');
  const csv = challengesAttachmentsToCsv(challenges);
  if (process.argv.includes('--rename-files')) {
    renameChallengesAttachments(challenges, backupBaseFolder);
  }
  fs.writeFileSync(backupBaseFolder + 'challenges.csv', csv);
}

function challengesAttachmentsToCsv(challenges) {
  const headers = "id,filename,size,alt,url,mimeType,type,challengeId";
  const lines = challenges.map(challenge => challengeAttachmentsToCsv(challenge)).filter( line => line !== '');
  return headers + "\n" + lines.join('\n');
}

function renameChallengesAttachments(challenges, backupBaseFolder) {
  const folder = backupBaseFolder + 'attachments/';
  challenges.forEach(challenge => renameFileToImport(challenge, (oldFilename, newFilename) => fs.copyFileSync(folder + oldFilename, folder + newFilename)));
}

function challengeAttachmentsToCsv(challenge) {
  const { fields } = challenge;
  const id = fields['Record ID'];
  const csv = [];

  const illustrations = fields['Illustration de la consigne'];
  if (illustrations) {
    const [illustration] = illustrations;
    pushInCsv(csv, [
      illustration.id,
      illustration.filename,
      illustration.size,
      fields['Texte alternatif illustration'] || '',
      illustration.url,
      illustration.type,
      'illustration',
      id,
    ]);
  }

  const attachments = fields['Pièce jointe'];
  if (attachments) {
    attachments.forEach((attachment) => {
      pushInCsv(csv, [
        attachment.id,
        attachment.filename,
        attachment.size,
        '',
        attachment.url,
        attachment.type,
        'attachment',
        id,
      ]);
    });
  }
  return csv.join('\n');
}

function pushInCsv(csv, fields) {
  return csv.push(fields.map(v => `"${escapeField(`${v}`)}"`).join(','));
}

function newFilename({ challengeId, filename, type }) {
  return `${challengeId}_${type}_${filename}`;
}

function escapeField(field) {
  if (!field) {
    return '';
  }
  return field.replace(/"/g, '""');
}

function renameFileToImport(challenge, renameFile) {
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

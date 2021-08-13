const chai = require('chai');
const { attachmentUrl, challengeAttachmentsToCsv, challengesAttachmentsToCsv, renameFileToImport } = require('./index.js');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const expect = chai.expect;

describe('challengeAttachmentsToCsv', function() {

  it('returns illustration as CSV string', function() {
    const illustration = {
      'filename': 'mailPJ.png',
      'id': 'attcKBWOyCUyATJ93',
      'size': 49502,
      'thumbnails': {
        'full': {
          'height': 356,
          'url': 'https://dl.airtable.com/KBwIk4uSTUEoUPtUlkYJ_full_mailPJ.png',
          'width': 1096
        },
        'large': {
          'height': 356,
          'url': 'https://dl.airtable.com/g39wHIzTyy3isaTsn4BQ_large_mailPJ.png',
          'width': 1096
        },
        'small': {
          'height': 36,
          'url': 'https://dl.airtable.com/2ADEU4ljTK32ts6nbkeA_small_mailPJ.png',
          'width': 111
        }
      },
      'type': 'image/png',
      'url': 'https://dl.airtable.com/aa1yQxsRL2AdZYaZQNB2_mailPJ.png'
    };

    const challenge = {
      fields: {
        'Illustration de la consigne': [illustration],
        'Texte alternatif illustration': 'alternative text',
        'Record ID': 'some-challenge-id',
      },
    };

    const bucketBaseUrl = 'https://dl.ovh.com/bucket/';
    const expectedCsv = '"attcKBWOyCUyATJ93","mailPJ.png","49502","alternative text","https://dl.ovh.com/bucket/some-challenge-id_illustration_mailPJ.png","image/png","illustration","some-challenge-id"';

    const csv = challengeAttachmentsToCsv(challenge, { bucketBaseUrl });

    expect(csv).to.equal(expectedCsv);
  });

  it('returns illustration as CSV string with no alt text', function() {
    const illustration = {
      'filename': 'mailPJ.png',
      'id': 'attcKBWOyCUyATJ93',
      'size': 49502,
      'thumbnails': {
        'full': {
          'height': 356,
          'url': 'https://dl.airtable.com/KBwIk4uSTUEoUPtUlkYJ_full_mailPJ.png',
          'width': 1096
        },
        'large': {
          'height': 356,
          'url': 'https://dl.airtable.com/g39wHIzTyy3isaTsn4BQ_large_mailPJ.png',
          'width': 1096
        },
        'small': {
          'height': 36,
          'url': 'https://dl.airtable.com/2ADEU4ljTK32ts6nbkeA_small_mailPJ.png',
          'width': 111
        }
      },
      'type': 'image/png',
      'url': 'https://dl.airtable.com/aa1yQxsRL2AdZYaZQNB2_mailPJ.png'
    };

    const challenge = {
      fields: {
        'Illustration de la consigne': [illustration],
        'Record ID': 'some-challenge-id',
      },
    };

    const bucketBaseUrl = 'https://dl.ovh.com/bucket/';
    const expectedCsv = '"attcKBWOyCUyATJ93","mailPJ.png","49502","","https://dl.ovh.com/bucket/some-challenge-id_illustration_mailPJ.png","image/png","illustration","some-challenge-id"';

    const csv = challengeAttachmentsToCsv(challenge, { bucketBaseUrl });

    expect(csv).to.equal(expectedCsv);
  });

  it('returns attachments as CSV string', function() {
    const attachments = [
      {
        'filename': 'Pix_etoile.odp',
        'id': 'attmRoYR3AfCyUiLW',
        'size': 21258,
        'type': 'application/vnd.oasis.opendocument.presentation',
        'url': 'https://dl.airtable.com/.attachments/afccd3fd63ded48bec58499f6024abce/5839412f/Pix_etoile.odp'
      },
      {
        'filename': 'Pix_etoile.pptx',
        'id': 'attLwY7ni4a6Naboz',
        'size': 34753,
        'thumbnails': {
          'large': {
            'height': 240,
            'url': 'https://dl.airtable.com/attLwY7ni4a6Naboz-1a5ab1ea4c7a527b-320x240.jpg',
            'width': 320
          },
          'small': {
            'height': 32,
            'url': 'https://dl.airtable.com/attLwY7ni4a6Naboz-fe6474e0106877ac-32x32.jpg',
            'width': 32
          }
        },
        'type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'url': 'https://dl.airtable.com/.attachments/3ff6e126ae8aa58d6b1109fd61db414c/cdd2a4fe/Pix_etoile.pptx'
      }
    ];

    const challenge = {
      fields: {
        'Pièce jointe': attachments,
        'Record ID': 'some-challenge-id',
      }
    };

    const bucketBaseUrl = 'https://dl.ovh.com/bucket/';
    const expectedCsv = '"attmRoYR3AfCyUiLW","Pix_etoile.odp","21258","","https://dl.ovh.com/bucket/some-challenge-id_attachment_Pix_etoile.odp","application/vnd.oasis.opendocument.presentation","attachment","some-challenge-id"' + '\n' +
                        '"attLwY7ni4a6Naboz","Pix_etoile.pptx","34753","","https://dl.ovh.com/bucket/some-challenge-id_attachment_Pix_etoile.pptx","application/vnd.openxmlformats-officedocument.presentationml.presentation","attachment","some-challenge-id"';

    const csv = challengeAttachmentsToCsv(challenge, { bucketBaseUrl });

    expect(csv).to.equal(expectedCsv);
  });

  it('returns attachments and illustrations as CSV string', function() {
    const illustration = {
      'filename': 'mailPJ.png',
      'id': 'attcKBWOyCUyATJ93',
      'size': 49502,
      'type': 'image/png',
      'url': 'https://dl.airtable.com/aa1yQxsRL2AdZYaZQNB2_mailPJ.png'
    };

    const attachments = [
      {
        'filename': 'Pix_etoile.odp',
        'id': 'attmRoYR3AfCyUiLW',
        'size': 21258,
        'type': 'application/vnd.oasis.opendocument.presentation',
        'url': 'https://dl.airtable.com/.attachments/afccd3fd63ded48bec58499f6024abce/5839412f/Pix_etoile.odp'
      },
    ];

    const challenge = {
      fields: {
        'Pièce jointe': attachments,
        'Record ID': 'some-challenge-id',
        'Illustration de la consigne': [illustration],
        'Texte alternatif illustration': 'alternative text',
      },
    };

    const bucketBaseUrl = 'https://dl.ovh.com/bucket/';
    const expectedCsv = '"attcKBWOyCUyATJ93","mailPJ.png","49502","alternative text","https://dl.ovh.com/bucket/some-challenge-id_illustration_mailPJ.png","image/png","illustration","some-challenge-id"' + '\n' +
                        '"attmRoYR3AfCyUiLW","Pix_etoile.odp","21258","","https://dl.ovh.com/bucket/some-challenge-id_attachment_Pix_etoile.odp","application/vnd.oasis.opendocument.presentation","attachment","some-challenge-id"';

    const csv = challengeAttachmentsToCsv(challenge, { bucketBaseUrl });

    expect(csv).to.equal(expectedCsv);
  });

  it('returns illustration as CSV string with escaped alternative text', function() {
    const illustration = {
      'filename': 'mailPJ.png',
      'id': 'attcKBWOyCUyATJ93',
      'size': 49502,
      'type': 'image/png',
      'url': 'https://dl.airtable.com/aa1yQxsRL2AdZYaZQNB2_mailPJ.png'
    };

    const challenge = {
      fields: {
        'Illustration de la consigne': [illustration],
        'Texte alternatif illustration': 'Bonjour "Monsieur", \n Je suis un texte alternatif !',
        'Record ID': 'some-challenge-id',
      },
    };

    const bucketBaseUrl = 'https://dl.ovh.com/bucket/';
    const expectedCsv = '"attcKBWOyCUyATJ93","mailPJ.png","49502","Bonjour ""Monsieur"", \n Je suis un texte alternatif !","https://dl.ovh.com/bucket/some-challenge-id_illustration_mailPJ.png","image/png","illustration","some-challenge-id"';

    const csv = challengeAttachmentsToCsv(challenge, { bucketBaseUrl });

    expect(csv).to.equal(expectedCsv);
  });

});

describe('challengesAttachmentsToCsv', function() {
  it('returns a csv string with a header and lines', function() {
    const illustration = {
      'filename': 'mailPJ.png',
      'id': 'attcKBWOyCUyATJ93',
      'size': 49502,
      'type': 'image/png',
      'url': 'https://dl.airtable.com/aa1yQxsRL2AdZYaZQNB2_mailPJ.png'
    };

    const attachments = [
      {
        'filename': 'Pix_etoile.odp',
        'id': 'attmRoYR3AfCyUiLW',
        'size': 21258,
        'type': 'application/vnd.oasis.opendocument.presentation',
        'url': 'https://dl.airtable.com/.attachments/afccd3fd63ded48bec58499f6024abce/5839412f/Pix_etoile.odp'
      },
    ];

    const challenge = {
      fields: {
        'Pièce jointe': attachments,
        'Record ID': 'some-challenge-id2',
        'Illustration de la consigne': [illustration],
        'Texte alternatif illustration': 'alternative text',
      },
    };

    const challenges = [challenge, challenge];
    const bucketBaseUrl = 'https://dl.ovh.com/bucket/';
    const expectedCsv = 'id,filename,size,alt,url,mimeType,type,challengeId' + '\n' +
          '"attcKBWOyCUyATJ93","mailPJ.png","49502","alternative text","https://dl.ovh.com/bucket/some-challenge-id2_illustration_mailPJ.png","image/png","illustration","some-challenge-id2"' + '\n' +
                        '"attmRoYR3AfCyUiLW","Pix_etoile.odp","21258","","https://dl.ovh.com/bucket/some-challenge-id2_attachment_Pix_etoile.odp","application/vnd.oasis.opendocument.presentation","attachment","some-challenge-id2"' + '\n' +
    '"attcKBWOyCUyATJ93","mailPJ.png","49502","alternative text","https://dl.ovh.com/bucket/some-challenge-id2_illustration_mailPJ.png","image/png","illustration","some-challenge-id2"' + '\n' +
    '"attmRoYR3AfCyUiLW","Pix_etoile.odp","21258","","https://dl.ovh.com/bucket/some-challenge-id2_attachment_Pix_etoile.odp","application/vnd.oasis.opendocument.presentation","attachment","some-challenge-id2"';

    const csv = challengesAttachmentsToCsv(challenges, { bucketBaseUrl });

    expect(csv).to.equal(expectedCsv);
  });
});

describe('challenges doesn\'t have any attachments and illustration', function() {
  it('should return a challenge csv file without attachments and illustration', function() {
    const challenge = {
      fields: {
        'Record ID': 'some-challenge-id',
      },
    };

    const challenges = [challenge, challenge];
    const bucketBaseUrl = 'https://dl.ovh.com/bucket/';
    const expectedCsv = 'id,filename,size,alt,url,mimeType,type,challengeId' + '\n';

    const csv = challengesAttachmentsToCsv(challenges, { bucketBaseUrl });

    expect(csv).to.equal(expectedCsv);
  });
});

describe('rename files', function() {
  it('should rename illustration', function() {
    const illustration = {
      'filename': 'mailPJ.png',
      'id': 'attcKBWOyCUyATJ93',
      'size': 49502,
      'type': 'image/png',
      'url': 'https://dl.airtable.com/aa1yQxsRL2AdZYaZQNB2_mailPJ.png'
    };

    const challenge = {
      fields: {
        'Illustration de la consigne': [illustration],
        'Texte alternatif illustration': 'Bonjour "Monsieur", \n Je suis un texte alternatif !',
        'Record ID': 'some-challenge-id',
      },
    };

    const stubRenameSync = sinon.stub();

    renameFileToImport(challenge, stubRenameSync);

    expect(stubRenameSync).to.be.calledWith('attcKBWOyCUyATJ93.png', 'some-challenge-id_illustration_mailPJ.png');
  });

  it('should rename attachment', function() {
    const attachments = [
      {
        'filename': 'Pix_etoile.odp',
        'id': 'attmRoYR3AfCyUiLW',
        'size': 21258,
        'type': 'application/vnd.oasis.opendocument.presentation',
        'url': 'https://dl.airtable.com/.attachments/afccd3fd63ded48bec58499f6024abce/5839412f/Pix_etoile.odp'
      },
    ];

    const challenge = {
      fields: {
        'Pièce jointe': attachments,
        'Texte alternatif illustration': 'Bonjour "Monsieur", \n Je suis un texte alternatif !',
        'Record ID': 'some-challenge-id2',
      },
    };

    const stubRenameSync = sinon.stub();

    renameFileToImport(challenge, stubRenameSync);

    expect(stubRenameSync).to.be.calledWith('attmRoYR3AfCyUiLW.odp', 'some-challenge-id2_attachment_Pix_etoile.odp');
  });

  it('should rename illustration and attachments', function() {
    const illustration = {
      'filename': 'mailPJ.png',
      'id': 'attcKBWOyCUyATJ93',
      'size': 49502,
      'type': 'image/png',
      'url': 'https://dl.airtable.com/aa1yQxsRL2AdZYaZQNB2_mailPJ.png'
    };

    const attachments = [
      {
        'filename': 'Pix_etoile.odp',
        'id': 'attmRoYR3AfCyUiLW',
        'size': 21258,
        'type': 'application/vnd.oasis.opendocument.presentation',
        'url': 'https://dl.airtable.com/.attachments/afccd3fd63ded48bec58499f6024abce/5839412f/Pix_etoile.odp'
      },
      {
        'filename': 'Pix_etoile.pptx',
        'id': 'attLwY7ni4a6Naboz',
        'size': 34753,
        'type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'url': 'https://dl.airtable.com/.attachments/3ff6e126ae8aa58d6b1109fd61db414c/cdd2a4fe/Pix_etoile.pptx'
      }
    ];

    const challenge = {
      fields: {
        'Illustration de la consigne': [illustration],
        'Pièce jointe': attachments,
        'Texte alternatif illustration': 'Bonjour "Monsieur", \n Je suis un texte alternatif !',
        'Record ID': 'some-challenge-id3',
      },
    };

    const stubRenameSync = sinon.stub();

    renameFileToImport(challenge, stubRenameSync);

    expect(stubRenameSync).to.be.calledWith('attcKBWOyCUyATJ93.png', 'some-challenge-id3_illustration_mailPJ.png');
    expect(stubRenameSync).to.be.calledWith('attmRoYR3AfCyUiLW.odp', 'some-challenge-id3_attachment_Pix_etoile.odp');
    expect(stubRenameSync).to.be.calledWith('attLwY7ni4a6Naboz.pptx', 'some-challenge-id3_attachment_Pix_etoile.pptx');
  });
});

describe('Attachment url', function() {
  it('should construct attachment url', function() {
    const challengeId = 'some-challenge-id3';
    const filename = 'Pix etoile.odp';
    const bucketBaseUrl = 'https://dl.ovh.com/bucket/';

    const url = attachmentUrl({ challengeId, filename, type: 'attachment', bucketBaseUrl });

    expect(url).to.equal('https://dl.ovh.com/bucket/some-challenge-id3_attachment_Pix%20etoile.odp');
  });
});

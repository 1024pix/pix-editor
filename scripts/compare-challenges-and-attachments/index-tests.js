const chai = require('chai');
const { checkChallengeAttachments } = require('.');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const expect = chai.expect;

describe('checkChallengeAttachments', () => {

  it('returns empty table when attachments are correct for given challenge', () => {
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
        'Texte alternatif illustration': 'alternative text',
        'Record ID': 'some-challenge-id',
      },
    };

    const attachment = {
      'fields': {
        'id': 'attcKBWOyCUyATJ93',
        'Record ID': 'reczu9rZzvVD07Gme',
        'challengeId': ['some-challenge-id'],
        'filename': 'mailPJ.png',
        'mimeType': 'image/png',
        'size': 49502,
        'type': 'illustration',
        'url': 'https://dl.airtable.com/aa1yQxsRL2AdZYaZQNB2_mailPJ.png',
        'alt': 'alternative text',
      },
      'id': 'reczu9rZzvVD07Gme'
    };

    const attachments = [attachment];

    const differences = checkChallengeAttachments(challenge, attachments);

    expect(differences).to.deep.equal([]);
  });

  it('returns table containing missing illustration when any', () => {
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
        'Texte alternatif illustration': 'alternative text',
        'Record ID': 'some-challenge-id',
      },
    };

    const attachments = [];
    const expectedDifference = {
      'alt': 'alternative text',
      'filename': 'mailPJ.png',
      'mimeType': 'image/png',
      'size': 49502,
      'type': 'illustration',
      'url': 'https://dl.airtable.com/aa1yQxsRL2AdZYaZQNB2_mailPJ.png',
    }

    const differences = checkChallengeAttachments(challenge, attachments);

    expect(differences).to.deep.equal([expectedDifference]);
  });

  it('returns table containing missing attachment when any', () => {
    const attachment = {
      'filename': 'mailPJ.png',
      'id': 'attcKBWOyCUyATJ93',
      'size': 49502,
      'type': 'image/png',
      'url': 'https://dl.airtable.com/aa1yQxsRL2AdZYaZQNB2_mailPJ.png'
    };

    const challenge = {
      fields: {
        'Pièce jointe': [attachment],
        'Record ID': 'some-challenge-id',
      },
    };

    const attachments = [];
    const expectedDifference = {
      'alt': '',
      'filename': 'mailPJ.png',
      'mimeType': 'image/png',
      'size': 49502,
      'type': 'attachment',
      'url': 'https://dl.airtable.com/aa1yQxsRL2AdZYaZQNB2_mailPJ.png',
    }

    const differences = checkChallengeAttachments(challenge, attachments);

    expect(differences).to.deep.equal([expectedDifference]);
  });
});


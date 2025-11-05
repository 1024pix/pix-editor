import { describe, expect, it, vi } from 'vitest';

import { checkChallengeAttachments } from './index.js';

describe('checkChallengeAttachments', function () {
  it('returns empty table when attachments are correct for given challenge', async function () {
    const illustration = {
      filename: 'mailPJ.png',
      id: 'attcKBWOyCUyATJ93',
      size: 49502,
      type: 'image/png',
      url: 'https://dl.airtable.com/aa1yQxsRL2AdZYaZQNB2_mailPJ.png',
    };

    const challenge = {
      fields: {
        'Illustration de la consigne': [illustration],
        'Texte alternatif illustration': 'alternative text',
        'Record ID': 'some-challenge-id',
      },
    };

    const attachment = {
      fields: {
        'id': 'attcKBWOyCUyATJ93',
        'Record ID': 'reczu9rZzvVD07Gme',
        'challengeId': ['some-challenge-id'],
        'filename': 'mailPJ.png',
        'mimeType': 'image/png',
        'size': 49502,
        'type': 'illustration',
        'url': 'https://dl.pix.fr/aa1yQxsRL2AdZYaZQNB2_mailPJ.png',
        'alt': 'alternative text',
      },
      id: 'reczu9rZzvVD07Gme',
    };

    const remoteChecksumComputer = vi.fn().mockResolvedValue('sha1');

    const attachments = [attachment];

    const differences = await checkChallengeAttachments(challenge, attachments, remoteChecksumComputer);

    expect(differences).to.deep.equal([]);
  });

  it('returns array containing illustrations with wrong checksum', async function () {
    const illustration = {
      filename: 'mailPJ.png',
      id: 'attcKBWOyCUyATJ93',
      size: 49502,
      type: 'image/png',
      url: 'https://dl.airtable.com/aa1yQxsRL2AdZYaZQNB2_mailPJ.png',
    };

    const challenge = {
      fields: {
        'Illustration de la consigne': [illustration],
        'Texte alternatif illustration': 'alternative text',
        'Record ID': 'some-challenge-id',
      },
    };

    const attachment = {
      fields: {
        'id': 'attcKBWOyCUyATJ93',
        'Record ID': 'reczu9rZzvVD07Gme',
        'challengeId': ['some-challenge-id'],
        'filename': 'mailPJ.png',
        'mimeType': 'image/png',
        'size': 49502,
        'type': 'illustration',
        'url': 'https://dl.pix.fr/aa1yQxsRL2AdZYaZQNB2_mailPJ.png',
        'alt': 'alternative text',
      },
      id: 'reczu9rZzvVD07Gme',
    };

    const attachments = [attachment];
    const expectedDifference = {
      checksum: 'checksum',
      alt: 'alternative text',
      filename: 'mailPJ.png',
      mimeType: 'image/png',
      size: 49502,
      type: 'illustration',
    };

    const remoteChecksumComputer = vi.fn();
    remoteChecksumComputer.mockResolvedValueOnce('checksum').mockResolvedValueOnce('different-checksum');

    const differences = await checkChallengeAttachments(challenge, attachments, remoteChecksumComputer);

    // then
    expect(differences).to.deep.equal([expectedDifference]);
  });

  it('returns table containing missing illustration when any', async function () {
    const illustration = {
      filename: 'mailPJ.png',
      id: 'attcKBWOyCUyATJ93',
      size: 49502,
      type: 'image/png',
      url: 'https://dl.airtable.com/aa1yQxsRL2AdZYaZQNB2_mailPJ.png',
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
      alt: 'alternative text',
      checksum: 'checksum',
      filename: 'mailPJ.png',
      mimeType: 'image/png',
      size: 49502,
      type: 'illustration',
    };

    const remoteChecksumComputer = vi.fn();
    remoteChecksumComputer.mockResolvedValue('checksum');

    const differences = await checkChallengeAttachments(challenge, attachments, remoteChecksumComputer);

    expect(differences).to.deep.equal([expectedDifference]);
  });

  it('returns table containing missing attachment when any', async function () {
    const attachment = {
      filename: 'mailPJ.png',
      id: 'attcKBWOyCUyATJ93',
      size: 49502,
      type: 'image/png',
      url: 'https://dl.airtable.com/aa1yQxsRL2AdZYaZQNB2_mailPJ.png',
    };

    const challenge = {
      fields: {
        'Pièce jointe': [attachment],
        'Record ID': 'some-challenge-id',
      },
    };

    const attachments = [];
    const expectedDifference = {
      alt: '',
      checksum: 'checksum',
      filename: 'mailPJ.png',
      mimeType: 'image/png',
      size: 49502,
      type: 'attachment',
    };

    const remoteChecksumComputer = vi.fn();
    remoteChecksumComputer.mockResolvedValue('checksum');

    const differences = await checkChallengeAttachments(challenge, attachments, remoteChecksumComputer);

    expect(differences).to.deep.equal([expectedDifference]);
  });

  it('ignore when attachments alt have space before new line', async function () {
    const illustration = {
      filename: 'mailPJ.png',
      id: 'attcKBWOyCUyATJ93',
      size: 49502,
      type: 'image/png',
      url: 'https://dl.airtable.com/aa1yQxsRL2AdZYaZQNB2_mailPJ.png',
    };

    const challenge = {
      fields: {
        'Illustration de la consigne': [illustration],
        'Texte alternatif illustration': 'alternative text . \ntest',
        'Record ID': 'some-challenge-id',
      },
    };

    const attachment = {
      fields: {
        'id': 'attcKBWOyCUyATJ93',
        'Record ID': 'reczu9rZzvVD07Gme',
        'challengeId': ['some-challenge-id'],
        'filename': 'mailPJ.png',
        'mimeType': 'image/png',
        'size': 49502,
        'type': 'illustration',
        'url': 'https://dl.airtable.com/aa1yQxsRL2AdZYaZQNB2_mailPJ.png',
        'alt': 'alternative text .\ntest',
      },
      id: 'reczu9rZzvVD07Gme',
    };

    const attachments = [attachment];

    const remoteChecksumComputer = vi.fn();
    remoteChecksumComputer.mockResolvedValue('checksum');

    const differences = await checkChallengeAttachments(challenge, attachments, remoteChecksumComputer);

    expect(differences).to.deep.equal([]);
  });
});

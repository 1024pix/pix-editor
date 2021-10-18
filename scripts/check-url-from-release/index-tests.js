const chai = require('chai');
const expect = chai.expect;
const { findUrlsFromChallenge, findUrlsFromRelease, buildCsv } = require('.');

describe('Check urls from release', function() {
  describe('#findUrlsFromChallenge', function() {
    it('should not find url from a challenge when there is no url', function() {
      const challenge = {
        id: 'challenge123',
        instruction: 'instructions',
      };
      const urls = findUrlsFromChallenge(challenge);

      expect(urls).to.deep.equal([]);
    });

    it('should find url from a challenge', function() {
      const challenge = {
        id: 'challenge123',
        instruction: 'instructions [link](https://example.com/)',
      };
      const urls = findUrlsFromChallenge(challenge);

      expect(urls).to.deep.equal(['https://example.com/']);
    });
  });

  describe('#findUrlsFromRelease', function() {
    it('should find urls from a release', function() {
      const release = {
        challenges: [
          {
            id: 'challenge1',
            instruction: 'instructions [link](https://example.net/) further instructions [other_link](https://other_example.net/)',
          },
          {
            id: 'challenge2',
            instruction: 'instructions',
          },
          {
            id: 'challenge3',
            instruction: 'instructions [link](https://example.com/)',
          }
        ]
      };
      
      const expectedOutput = [
        { id: 'challenge1', url: 'https://example.net/' }, 
        { id: 'challenge1', url: 'https://other_example.net/' }, 
        { id: 'challenge3', url: 'https://example.com/' },
      ]

      const urls = findUrlsFromRelease(release);
      
      expect(urls).to.deep.equal(expectedOutput);
    });

  });
});

describe('#buildCSV', function() {
  it('should build a CSV with the found URLs', function() {
    const urlList = [
      { id: 'challenge1', url: 'https://example.net/' }, 
      { id: 'challenge1', url: 'https://other_example.net/' }, 
      { id: 'challenge3', url: 'https://example.com/' },
    ];

    const expectedOutput = `challenge1,https://example.net/
challenge1,https://other_example.net/
challenge3,https://example.com/`;

    const csv = buildCsv(urlList);

    expect(csv).to.equal(expectedOutput);
  });
});
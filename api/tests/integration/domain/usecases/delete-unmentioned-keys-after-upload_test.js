import { describe, expect, it } from 'vitest';
import nock from 'nock';
import { RETRY, COMPLETED, deleteUnmentionedKeysAfterUpload } from '../../../../lib/domain/usecases/index.js';

describe('Integration | Usecases | Delete unmentioned keys after upload', function() {
  it('should delete unmentioned keys when upload is in success', async function() {
    // given
    const phraseAPIUpload = nock('https://api.phrase.com')
      .get('/v2/projects/MY_PHRASE_PROJECT_ID/uploads/upload-id')
      .matchHeader('authorization', 'token MY_PHRASE_ACCESS_TOKEN')
      .reply(200,  {
        id: 'upload-id',
        state: 'success',
        summary: {
          translation_keys_unmentioned: 2,
        },
      });

    const phraseAPIDelete = nock('https://api.phrase.com')
      .delete('/v2/projects/MY_PHRASE_PROJECT_ID/keys')
      .matchHeader('authorization', 'token MY_PHRASE_ACCESS_TOKEN')
      .query({
        q: 'unmentioned_in_upload:upload-id'
      })
      .reply(200, {
        records_affected: 2
      });

    // when
    const result = await deleteUnmentionedKeysAfterUpload('upload-id');

    // then
    expect(result).to.equal(COMPLETED);
    expect(phraseAPIUpload.isDone()).to.be.true;
    expect(phraseAPIDelete.isDone()).to.be.true;
  });

  it('should not delete unmentioned keys when there is no unmentioned keys', async function() {
    // given
    const phraseAPIUpload = nock('https://api.phrase.com')
      .get('/v2/projects/MY_PHRASE_PROJECT_ID/uploads/upload-id')
      .matchHeader('authorization', 'token MY_PHRASE_ACCESS_TOKEN')
      .reply(200,  {
        id: 'upload-id',
        state: 'success',
        summary: {
          translation_keys_unmentioned: 0,
        },
      });

    const phraseAPIDelete = nock('https://api.phrase.com')
      .delete('/v2/projects/MY_PHRASE_PROJECT_ID/keys')
      .matchHeader('authorization', 'token MY_PHRASE_ACCESS_TOKEN')
      .query({
        q: 'unmentioned_in_upload:upload-id'
      })
      .reply(200, {
        records_affected: 0
      });

    // when
    const result = await deleteUnmentionedKeysAfterUpload('upload-id');

    // then
    expect(result).to.equal(COMPLETED);
    expect(phraseAPIUpload.isDone()).to.be.true;
    expect(phraseAPIDelete.isDone()).to.be.false;
  });

  it('should returns status retry when the upload is processing', async function() {
    // given
    const phraseAPIUpload = nock('https://api.phrase.com')
      .get('/v2/projects/MY_PHRASE_PROJECT_ID/uploads/upload-id')
      .matchHeader('authorization', 'token MY_PHRASE_ACCESS_TOKEN')
      .reply(200, {
        id: 'upload-id',
        state: 'processing'
      });

    const phraseAPIDelete = nock('https://api.phrase.com')
      .delete('/v2/projects/MY_PHRASE_PROJECT_ID/keys')
      .matchHeader('authorization', 'token MY_PHRASE_ACCESS_TOKEN')
      .query({
        q: 'unmentioned_in_upload:upload-id'
      })
      .reply(200,  {
        records_affected: 0
      });

    // when
    const result = await deleteUnmentionedKeysAfterUpload('upload-id');

    // then
    expect(result).to.equal(RETRY);
    expect(phraseAPIUpload.isDone()).to.be.true;
    expect(phraseAPIDelete.isDone()).to.be.false;
  });

  it('should returns status completed when the upload is in error', async function() {
    // given
    const phraseAPIUpload = nock('https://api.phrase.com')
      .get('/v2/projects/MY_PHRASE_PROJECT_ID/uploads/upload-id')
      .matchHeader('authorization', 'token MY_PHRASE_ACCESS_TOKEN')
      .reply(200, {
        id: 'upload-id',
        state: 'error'
      });

    const phraseAPIDelete = nock('https://api.phrase.com')
      .delete('/v2/projects/MY_PHRASE_PROJECT_ID/keys')
      .matchHeader('authorization', 'token MY_PHRASE_ACCESS_TOKEN')
      .query({
        q: 'unmentioned_in_upload:upload-id'
      })
      .reply(200,  {
        records_affected: 0
      });

    // when
    const result = await deleteUnmentionedKeysAfterUpload('upload-id');

    // then
    expect(result).to.equal(COMPLETED);
    expect(phraseAPIUpload.isDone()).to.be.true;
    expect(phraseAPIDelete.isDone()).to.be.false;
  });
});

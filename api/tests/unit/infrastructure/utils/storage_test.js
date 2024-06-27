import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fileStorageTokenRepository } from '../../../../lib/infrastructure/repositories/index.js';
import * as config from '../../../../lib/config.js';
import nock from 'nock';
import { domainBuilder } from '../../../test-helper.js';
import { cloneAttachmentsFileInBucket } from '../../../../lib/infrastructure/utils/storage.js';

describe('Unit | Infrastructure | Storage', () => {

  describe('#cloneAttachmentsFileInBucket', () => {
    const token = 'mon_super_token';
    beforeEach(() => {
      vi.spyOn(fileStorageTokenRepository, 'create').mockImplementation(() => ({ value: token }));
      vi.useFakeTimers({
        now: new Date('2021-07-14T03:04:00Z'),
        toFake: ['Date'],
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it('should clone files', async () => {
      // given
      const attachmentA = domainBuilder.buildAttachment({
        url: `${config.pixEditor.storagePost}un_dossier/mon_imageA.jpg`,
      });
      const attachmentB = domainBuilder.buildAttachment({
        url: `${config.pixEditor.storagePost}un_dossier/mon_imageB.jpg`,
      });
      const attachmentC = domainBuilder.buildAttachment({
        url: `${config.pixEditor.storagePost}un_autre_dossier/mon_imageA.jpg`,
      });
      const expectedDestUrlA = `${config.pixEditor.storagePost}${Date.now()}_001/mon_imageA.jpg`;
      const expectedDestUrlB = `${config.pixEditor.storagePost}${Date.now()}_001/mon_imageB.jpg`;
      const expectedDestUrlC = `${config.pixEditor.storagePost}${Date.now()}_002/mon_imageA.jpg`;
      const [, baseUrlA, routeA] = [...expectedDestUrlA.matchAll(/^(http.*com)(.*)/g)][0];
      const requestInterceptorA = nock(baseUrlA)
        .put(routeA)
        .matchHeader('X-Auth-Token', token)
        .matchHeader('X-Copy-From', `${config.pixEditor.storageBucket}/un_dossier/mon_imageA.jpg`)
        .reply(200);
      const [, baseUrlB, routeB] = [...expectedDestUrlB.matchAll(/^(http.*com)(.*)/g)][0];
      const requestInterceptorB = nock(baseUrlB)
        .put(routeB)
        .matchHeader('X-Auth-Token', token)
        .matchHeader('X-Copy-From', `${config.pixEditor.storageBucket}/un_dossier/mon_imageB.jpg`)
        .reply(200);
      const [, baseUrlC, routeC] = [...expectedDestUrlC.matchAll(/^(http.*com)(.*)/g)][0];
      const requestInterceptorC = nock(baseUrlC)
        .put(routeC)
        .matchHeader('X-Auth-Token', token)
        .matchHeader('X-Copy-From', `${config.pixEditor.storageBucket}/un_autre_dossier/mon_imageA.jpg`)
        .reply(200);

      // when
      await cloneAttachmentsFileInBucket({ attachments: [attachmentA, attachmentB, attachmentC], millisecondsTimestamp: Date.now() });

      // then
      expect(requestInterceptorA.isDone()).to.be.true;
      expect(requestInterceptorB.isDone()).to.be.true;
      expect(requestInterceptorC.isDone()).to.be.true;
      expect(attachmentA.url).toStrictEqual(expectedDestUrlA);
      expect(attachmentB.url).toStrictEqual(expectedDestUrlB);
      expect(attachmentC.url).toStrictEqual(expectedDestUrlC);
    });
  });
});

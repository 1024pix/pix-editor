import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fileStorageTokenRepository } from '../../../../lib/infrastructure/repositories/index.js';
import * as config from '../../../../lib/config.js';
import nock from 'nock';
import { cloneFiles } from '../../../../lib/infrastructure/utils/storage.js';

describe('Unit | Infrastructure | Storage', () => {

  describe('#cloneFiles', () => {
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
      const originUrlA = `${config.pixEditor.storagePost}un_dossier/mon_imageA.jpg`;
      const originUrlB = `${config.pixEditor.storagePost}un_dossier/mon_imageB.jpg`;
      const expectedDestUrlA = `${config.pixEditor.storagePost}${Date.now()}/mon_imageA.jpg`;
      const expectedDestUrlB = `${config.pixEditor.storagePost}${Date.now()}/mon_imageB.jpg`;
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

      // when
      const clonedUrls = await cloneFiles({ urls: [originUrlA, originUrlB], millisecondsTimestamp: Date.now() });

      // then
      expect(requestInterceptorA.isDone()).to.be.true;
      expect(requestInterceptorB.isDone()).to.be.true;
      expect(clonedUrls).toStrictEqual([expectedDestUrlA, expectedDestUrlB]);
    });
  });
});

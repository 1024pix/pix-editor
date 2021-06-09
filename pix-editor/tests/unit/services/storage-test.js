import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import { mockAuthService } from '../../mock-auth';

module('Unit | Service | storage', function(hooks) {
  setupTest(hooks);

  module('uploadFile', function() {
    test('it should use file.name when filename is not defined', async function(assert) {
      // given
      const storageService = this.owner.lookup('service:storage');
      storageService.getStorageToken = sinon.stub().resolves();

      const configService = this.owner.lookup('service:config');
      configService.storagePost = 'https://dl.ovh.com/bucket/';

      const date = {
        now() { return 'NOW'; }
      };

      const file = {
        name: 'filename.txt',
        size: 25,
        type: 'text/plain',
        uploadBinary: sinon.stub().resolves(),
      };

      const expectedUploadedFile = {
        url: 'https://dl.ovh.com/bucket/NOW/filename.txt',
        filename: 'filename.txt',
        size: 25,
        type: 'text/plain',
      };

      // when
      const uploadedFile = await storageService.uploadFile({ file, undefined, date });

      // then
      assert.deepEqual(uploadedFile, expectedUploadedFile);
    });

    test('it should use filename when it is defined', async function(assert) {
      // given
      const storageService = this.owner.lookup('service:storage');
      storageService.getStorageToken = sinon.stub().resolves();

      const configService = this.owner.lookup('service:config');
      configService.storagePost = 'https://dl.ovh.com/bucket/';

      const date = {
        now() { return 'NOW2'; }
      };

      const file = {
        name: 'filename.txt',
        size: 25,
        type: 'text/plain',
        uploadBinary: sinon.stub().resolves(),
      };

      const filename = 'custom-filename.txt';

      const expectedUploadedFile = {
        url: 'https://dl.ovh.com/bucket/NOW2/custom-filename.txt',
        filename: 'custom-filename.txt',
        size: 25,
        type: 'text/plain',
      };

      // when
      const uploadedFile = await storageService.uploadFile({ file, filename, date });

      // then
      assert.deepEqual(uploadedFile, expectedUploadedFile);
    });

    test('it should add Content-Type header to illustration type', async function(assert) {
      // given
      const storageService = this.owner.lookup('service:storage');
      storageService.getStorageToken = sinon.stub().resolves('some-token');

      const configService = this.owner.lookup('service:config');
      configService.storagePost = 'https://dl.pix.fr/';

      const date = {
        now() { return 'NOW2'; }
      };

      const file = {
        name: 'filename.txt',
        size: 25,
        type: 'text/plain',
        uploadBinary: sinon.stub(),
      };

      file.uploadBinary.resolves();

      const filename = 'custom filename.txt';
      const expectedHeaders = {
        'Content-Type': 'text/plain',
        'X-Auth-Token': 'some-token',
      };

      // when
      await storageService.uploadFile({ file, filename, date, isAttachment: false });

      // then
      const { headers } = file.uploadBinary.args[0][1];
      assert.deepEqual(headers, expectedHeaders);
    });

    test('it should add Content-* headers to attachment type', async function(assert) {
      // given
      const storageService = this.owner.lookup('service:storage');
      storageService.getStorageToken = sinon.stub().resolves('some-token');

      const configService = this.owner.lookup('service:config');
      configService.storagePost = 'https://dl.pix.fr/';

      const date = {
        now() { return 'NOW2'; }
      };

      const file = {
        name: 'filename.txt',
        size: 25,
        type: 'text/plain',
        uploadBinary: sinon.stub(),
      };

      file.uploadBinary.resolves();

      const filename = 'custom filename.txt';
      const expectedHeaders = {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="custom%20filename.txt"',
        'X-Auth-Token': 'some-token',
      };

      // when
      await storageService.uploadFile({ file, filename, date, isAttachment: true });

      // then
      const { headers } = file.uploadBinary.args[0][1];
      assert.deepEqual(headers, expectedHeaders);
    });
  });

  module('cloneFile', function(hooks) {
    let storageService;
    let fetch;
    const storageToken = 'HaveFun';

    hooks.beforeEach(function () {
      storageService = this.owner.lookup('service:storage');
      storageService.getStorageToken = sinon.stub().resolves(storageToken);

      const configService = this.owner.lookup('service:config');
      configService.storagePost = 'https://dl.ovh.com/bucket/';
      configService.storageBucket = '/bucket';

      fetch = sinon.stub();
    });

    test('it should clone a file', async function(assert) {
      // given
      fetch.resolves();

      const date = {
        now() { return 'NOW2'; }
      };

      // when
      const uploadedUrl = await storageService.cloneFile('https://dl.ovh.com/bucket/NOW.txt', date, fetch);

      // then
      assert.equal(uploadedUrl, 'https://dl.ovh.com/bucket/NOW2/NOW.txt');
      assert.ok(fetch.calledOnce);
      assert.deepEqual(fetch.args[0], [uploadedUrl, {
        method: 'PUT',
        headers: {
          'X-Auth-Token': storageToken,
          'X-Copy-From': '/bucket/NOW.txt'
        }
      }]);
    });

    test('it should clone a file when the file is in a sub directory', async function(assert) {
      // given
      fetch.resolves();

      const date = {
        now() { return 'NOW2'; }
      };

      // when
      const uploadedUrl = await storageService.cloneFile('https://dl.ovh.com/bucket/NOW/test.txt', date, fetch);

      // then
      assert.equal(uploadedUrl, 'https://dl.ovh.com/bucket/NOW2/test.txt');
      assert.ok(fetch.calledOnce);
      assert.deepEqual(fetch.args[0], [uploadedUrl, {
        method: 'PUT',
        headers: {
          'X-Auth-Token': storageToken,
          'X-Copy-From': '/bucket/NOW/test.txt'
        }
      }]);
    });

    test('it should retry when token has expired', async function(assert) {
      // given
      fetch.onFirstCall().rejects({
        response: { status: 401 }
      });

      fetch.onSecondCall().resolves();

      const date = {
        now() { return 'NOW2'; }
      };

      // when
      const uploadedUrl = await storageService.cloneFile('https://dl.ovh.com/bucket/NOW.txt', date, fetch);

      // then
      assert.equal(uploadedUrl, 'https://dl.ovh.com/bucket/NOW2/NOW.txt');
      assert.ok(fetch.calledTwice);
      assert.deepEqual(fetch.args[0], [uploadedUrl, {
        method: 'PUT',
        headers: {
          'X-Auth-Token': storageToken,
          'X-Copy-From': '/bucket/NOW.txt'
        }
      }]);
    });

    test('it should retry when token has expired only one time', async function(assert) {
      // given
      fetch.rejects({
        response: { status: 401 }
      });

      const date = {
        now() { return 'NOW2'; }
      };

      // then
      try {
        // when
        await storageService.cloneFile('https://dl.ovh.com/bucket/NOW.txt', date, fetch);
        assert.ok(false, 'should raise en error');
      } catch (e) {
        assert.ok(true);
      }

      assert.ok(fetch.calledTwice);
    });

    test('it should raise error when API call failed', async function(assert) {
      // given
      fetch.rejects({
        response: { status: 400 }
      });

      const date = {
        now() { return 'NOW2'; }
      };

      // then
      try {
        // when
        await storageService.cloneFile('https://dl.ovh.com/bucket/NOW.txt', date, fetch);
        assert.ok(false, 'should raise an error');
      } catch (e) {
        assert.ok(true);
      }

      assert.ok(fetch.calledOnce);
    });
  });

  module('getStorageToken', function(hooks) {
    const apiKey = 'apiKey';

    hooks.beforeEach(function() {
      mockAuthService.call(this, apiKey);
    });

    test('it calls api', async function(assert) {
      const storageService = this.owner.lookup('service:storage');

      const token = 'token';
      const fetch = sinon.stub().resolves({
        ok: true,
        json() {
          return Promise.resolve({ token });
        }
      });

      const fetchedToken = await storageService.getStorageToken(false, fetch);

      assert.ok(fetch.calledOnce);
      assert.deepEqual(fetch.args[0], ['/api/file-storage-token', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer apiKey',
        }
      }]);
      assert.equal(fetchedToken, token);
    });

    test('it returns the previously stored token', async function(assert) {
      const storageService = this.owner.lookup('service:storage');
      const configService = this.owner.lookup('service:config');
      const token = 'token';
      configService.storageToken = token;
      const fetch = sinon.stub();

      const fetchedToken = await storageService.getStorageToken(false, fetch);

      assert.ok(fetch.notCalled);
      assert.equal(fetchedToken, token);
    });

    test('it always calls the api when renew is true', async function(assert) {
      const storageService = this.owner.lookup('service:storage');

      const configService = this.owner.lookup('service:config');
      const token = 'token';
      configService.storageToken = token;
      const fetch = sinon.stub().resolves({
        ok: true,
        json() {
          return Promise.resolve({ token });
        }
      });

      const fetchedToken = await storageService.getStorageToken(true, fetch);

      assert.ok(fetch.calledOnce);
      assert.deepEqual(fetch.args[0], ['/api/file-storage-token', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer apiKey',
        }
      }]);
      assert.equal(fetchedToken, token);
    });
  });

  module('renameFile', function(hooks) {
    let storageService;
    let fetch;
    const storageToken = 'HaveFun';

    hooks.beforeEach(function () {
      storageService = this.owner.lookup('service:storage');
      storageService.getStorageToken = sinon.stub().resolves(storageToken);

      const configService = this.owner.lookup('service:config');
      configService.storagePost = 'https://dl.ovh.com/bucket/';
      configService.storageBucket = '/bucket';

      fetch = sinon.stub();
    });

    test('it should rename the header of file', async function(assert) {
      // given
      fetch.resolves();

      // when
      await storageService.renameFile('https://dl.ovh.com/bucket/NOW.txt', 'update-file-name.jpg', fetch);

      // then
      assert.ok(fetch.calledOnce);
      assert.deepEqual(fetch.args[0], ['https://dl.ovh.com/bucket/NOW.txt', {
        method: 'POST',
        headers: {
          'X-Auth-Token': storageToken,
          'Content-Disposition': 'attachment; filename="update-file-name.jpg"',
        }
      }]);
    });

    test('it should retry when token has expired', async function(assert) {
      // given
      fetch.onFirstCall().rejects({
        response: { status: 401 }
      });

      fetch.onSecondCall().resolves();

      // when
      await storageService.renameFile('https://dl.ovh.com/bucket/NOW.txt', 'update-file-name.jpg', fetch);

      // then
      assert.ok(fetch.calledTwice);
      assert.deepEqual(fetch.args[0], ['https://dl.ovh.com/bucket/NOW.txt', {
        method: 'POST',
        headers: {
          'X-Auth-Token': storageToken,
          'Content-Disposition': 'attachment; filename="update-file-name.jpg"',
        }
      }]);
    });

    test('it should retry when token has expired only one time', async function(assert) {
      // given
      fetch.rejects({
        response: { status: 401 }
      });

      // then
      try {
        // when
        await storageService.renameFile('https://dl.ovh.com/bucket/NOW.txt', 'update-file-name.jpg', fetch);
        assert.ok(false, 'should raise en error');
      } catch (e) {
        assert.ok(true);
      }

      assert.ok(fetch.calledTwice);
    });

    test('it should raise error when API call failed', async function(assert) {
      // given
      fetch.rejects({
        response: { status: 400 }
      });

      // then
      try {
        // when
        await storageService.renameFile('https://dl.ovh.com/bucket/NOW.txt', 'update-file-name.jpg', fetch);
        assert.ok(false, 'should raise an error');
      } catch (e) {
        assert.ok(true);
      }

      assert.ok(fetch.calledOnce);
    });
  });

});

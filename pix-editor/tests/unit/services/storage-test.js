import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

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
        url: 'https://dl.ovh.com/bucket/NOW.txt',
        filename: 'filename.txt',
        size: 25,
        type: 'text/plain',
      };

      // when
      const uploadedFile = await storageService.uploadFile(file, undefined, date);

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
        url: 'https://dl.ovh.com/bucket/NOW2.txt',
        filename: 'custom-filename.txt',
        size: 25,
        type: 'text/plain',
      };

      // when
      const uploadedFile = await storageService.uploadFile(file, filename, date);

      // then
      assert.deepEqual(uploadedFile, expectedUploadedFile);
    });

    test('it should add Content-* headers', async function(assert) {
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
      await storageService.uploadFile(file, filename, date);

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
      assert.equal(uploadedUrl, 'https://dl.ovh.com/bucket/NOW2.txt');
      assert.ok(fetch.calledOnce);
      assert.deepEqual(fetch.args[0], [uploadedUrl, {
        method: 'PUT',
        headers: {
          'X-Auth-Token': storageToken,
          'X-Copy-From': '/bucket/NOW.txt'
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
      assert.equal(uploadedUrl, 'https://dl.ovh.com/bucket/NOW2.txt');
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
});

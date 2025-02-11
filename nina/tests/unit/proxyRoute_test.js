import { beforeEach, describe, expect, it, vi } from 'vitest';
import Hapi from '@hapi/hapi';
import * as route from '../../lib/application/middle/index.js';
import  * as middleController from '../../lib/application/middle/middle.js';


describe('Unit | Router | proxyRoute', function() {
  let server;
  
  beforeEach(function() {
    server = Hapi.server();
  });

  describe('GET /api/releases/latest', function() {
    let getLatestReleaseFromLCMSApiSpy

    beforeEach(function() {
      getLatestReleaseFromLCMSApiSpy = vi.spyOn(middleController, 'getLatestReleaseFromLCMSApi').mockReturnValue('ok');
      server.register(route);
    });

    it('should call getLatestReleaseFromLCMSApi controller', async function() {
      await server.inject({ method: 'GET', url: '/api/releases/latest' });
      expect(getLatestReleaseFromLCMSApiSpy).toHaveBeenCalled()
    });
  });


  describe('POST /api/releases', function() {
    let getLatestReleaseFromLCMSApiSpy

    beforeEach(function() {
      getLatestReleaseFromLCMSApiSpy = vi.spyOn(middleController, 'getLatestReleaseFromLCMSApi').mockReturnValue('ok');
      server.register(route);
    });

    it('should proxy to getLatestReleaseFromLCMSApi controller', async function() {
      await server.inject({ method: 'POST', url: '/api/releases' });
      expect(getLatestReleaseFromLCMSApiSpy).toHaveBeenCalled()
    });
  });


  describe('GET /api/releases/{id}', function() {
    let getLatestReleaseFromLCMSApiSpy

    beforeEach(function() {
      getLatestReleaseFromLCMSApiSpy = vi.spyOn(middleController, 'getLatestReleaseFromLCMSApi').mockReturnValue('ok');
      server.register(route);
    });

    it('should proxy to getLatestReleaseFromLCMSApi controller', async function() {
      await server.inject({ method: 'GET', url: '/api/releases/1' });
      expect(getLatestReleaseFromLCMSApiSpy).toHaveBeenCalled()
    });
  });
});

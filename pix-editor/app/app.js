import './deprecation-workflow';
import '@warp-drive/ember/install';

import Application from '@ember/application';
import compatModules from '@embroider/virtual/compat-modules';
import { setConfig } from '@warp-drive/build-config';
import loadInitializers from 'ember-load-initializers';
import Resolver from 'ember-resolver';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

import config from './config/environment';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver.withModules(compatModules);
}

loadInitializers(App, config.modulePrefix, compatModules);

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new JsonWorker();
    }
    return new EditorWorker();
  },
};

setConfig(App, import.meta.dirname, {
  deprecations: {
    DEPRECATE_TRACKING_PACKAGE: false,
  },
});

import './deprecation-workflow';

import Application from '@ember/application';
import { init as initSentry } from '@sentry/ember';
import loadInitializers from 'ember-load-initializers';
import Resolver from 'ember-resolver';
import config from './config/environment';

import compatModules from '@embroider/virtual/compat-modules';

import 'semantic-ui-css/semantic.css';

if (config.sentry.enabled) {
  initSentry();
}

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver.withModules(compatModules);
}

loadInitializers(App, config.modulePrefix, compatModules);

import Application from '@ember/application';
import Resolver from 'ember-resolver';
import config from 'pixeditor/config/environment';
import { InitSentryForEmber } from '@sentry/ember';

if (config.sentry.enabled) {
  InitSentryForEmber();
}

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

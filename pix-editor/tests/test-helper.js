import { setApplication } from '@ember/test-helpers';
import { start as startEmberExam } from 'ember-exam/test-support';
import Application from 'pixeditor/app';
import config from 'pixeditor/config/environment';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';

export async function start(options) {
  setApplication(Application.create(config.APP));

  setup(QUnit.assert);
  await startEmberExam(options);
}

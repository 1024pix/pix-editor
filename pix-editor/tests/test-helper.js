import { setApplication } from '@ember/test-helpers';
import { start as qunitStart } from 'ember-qunit';
import Application from 'pixeditor/app';
import config from 'pixeditor/config/environment';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';

export function start() {
  setApplication(Application.create(config.APP));

  setup(QUnit.assert);
  qunitStart();
}

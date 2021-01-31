import Application from 'pixeditor/app';
import config from 'pixeditor/config/environment';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';

setApplication(Application.create(config.APP));

setup(QUnit.assert);

start();

let actualApiKey;
QUnit.testStart(() => {
  actualApiKey = localStorage.getItem('pix-api-key');
});

QUnit.testDone(() => {
  localStorage.setItem('pix-api-key', actualApiKey);
});


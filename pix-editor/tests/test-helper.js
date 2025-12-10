import { setApplication } from '@ember/test-helpers';
import NotificationMessageService from 'ember-cli-notifications/services/notifications';
import { start } from 'ember-qunit';
import { loadTests } from 'ember-qunit/test-loader';
import Application from 'pix-editor/app';
import config from 'pix-editor/config/environment';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';

NotificationMessageService.reopen({
  removeNotification(notification) {
    if (!notification) {
      return;
    }

    notification.set('dismiss', true);

    const index = this.content.indexOf(notification);
    if (index !== -1) {
      this.content.splice(index, 1);
    }
  },
});

setApplication(Application.create(config.APP));

setup(QUnit.assert);
loadTests();
start();

import { setApplication } from '@ember/test-helpers';
import NotificationMessageService from 'ember-cli-notifications/services/notifications';
import { start } from 'ember-qunit';
import Application from 'pixeditor/app';
import config from 'pixeditor/config/environment';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';

NotificationMessageService.reopen({
  removeNotification(notification) {
    if (!notification) {
      return;
    }

    notification.set('dismiss', true);
    this.content.removeObject(notification);
  },
});

setApplication(Application.create(config.APP));

setup(QUnit.assert);

start();

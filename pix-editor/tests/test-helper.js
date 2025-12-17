import { setApplication } from '@ember/test-helpers';
import NotificationMessageService from 'ember-cli-notifications/services/notifications';
import { start as qunitStart } from 'ember-qunit';
import Application from 'pixeditor/app';
import config from 'pixeditor/config/environment';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';

export function start() {
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
  qunitStart();
}

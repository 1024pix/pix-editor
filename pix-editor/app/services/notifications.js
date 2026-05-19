import Service, { service } from '@ember/service';

export default class Notifications extends Service {
  @service pixToast;

  sendError(message) {
    this.pixToast.sendErrorNotification({ message });
  }

  sendWarning(message) {
    this.pixToast.sendWarningNotification({ message });
  }

  sendSuccess(message) {
    const toast = this.pixToast.sendSuccessNotification({ message });
    setTimeout(() => {
      this.pixToast.removeNotification(toast);
    }, 5000);
  }
}

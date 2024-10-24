export class CanExecute {
  constructor({ can, errorMessage }) {
    this.can = can;
    this.cannot = !can;
    this.errorMessage = errorMessage;
  }

  static cannot(errorMessage) {
    return new CanExecute({ can: false, errorMessage });
  }

  static can() {
    return new CanExecute({ can: true, errorMessage: null });
  }
}

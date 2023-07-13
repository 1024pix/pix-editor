const COMMAND_RESULT_STATES = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
};

class CommandResult {
  constructor({ state, value, failureReasons }) {
    this.state = state;
    this.value = value;
    this.failureReasons = failureReasons;
  }

  static Success({ value }) {
    return new CommandResult({ state: COMMAND_RESULT_STATES.SUCCESS, value, failureReasons: [] });
  }

  static Failure({ value, failureReasons }) {
    return new CommandResult({ state: COMMAND_RESULT_STATES.FAILURE, value, failureReasons });
  }

  isSuccess() {
    return this.state === COMMAND_RESULT_STATES.SUCCESS;
  }

  isFailure() {
    return this.state === COMMAND_RESULT_STATES.FAILURE;
  }
}

module.exports = CommandResult;

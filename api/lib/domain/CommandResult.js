const COMMAND_RESULT_STATES = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
};

class CommandResult {
  constructor({ state, value, error }) {
    this.state = state;
    this.value = value;
    this.error = error;
  }

  static Success({ value }) {
    return new CommandResult({ state: COMMAND_RESULT_STATES.SUCCESS, value, error: null });
  }

  static Failure({ value, error }) {
    return new CommandResult({ state: COMMAND_RESULT_STATES.FAILURE, value, error });
  }

  isSuccess() {
    return this.state === COMMAND_RESULT_STATES.SUCCESS;
  }

  isFailure() {
    return this.state === COMMAND_RESULT_STATES.FAILURE;
  }
}

module.exports = CommandResult;

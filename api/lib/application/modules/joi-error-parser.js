export const joiErrorParser = {
  // Set isSchemaError = true for JSON-Schema constraints (type/required/enum/pattern/min-max),
  // Set isSchemaError = false for errors raised from `.external()` validators
  toStructuredErrors(error) {
    return error.details.map((errorDetail) => {
      if (errorDetail.type !== 'external') {
        return { message: errorDetail.message, isSchemaError: true };
      }

      const isHtmlValidationError = Array.isArray(errorDetail.context?.value?.results);
      if (isHtmlValidationError) {
        return { message: logHtmlErrors(errorDetail), isSchemaError: false };
      }

      return { message: errorDetail.message, isSchemaError: false };
    });
  },
};

function logHtmlErrors(errorDetail) {
  const severity = [
    '',
    'Warning',
    'Error',
  ];
  const report = errorDetail.context.value;
  const errorLogs = [];
  for (const result of report.results) {
    const line = result.source ?? '';
    for (const message of result.messages) {
      const errorLog = [];
      errorLog.push('\n');
      errorLog.push(`Chemin : ${errorDetail.context.label}`);
      errorLog.push(`\n${severity[message.severity]}(${message.ruleId}): ${message.message}`);
      errorLog.push(`${message.ruleUrl}`);
      errorLog.push(`\nValeur concernée à rechercher :\n${line}\n`);
      errorLogs.push(errorLog.join('\n'));
    }
  }
  return errorLogs.join('');
}

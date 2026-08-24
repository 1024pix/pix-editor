export const joiErrorParser = {
  format({ error, objectErrorSeparator, visualSeparator }) {
    visualSeparator = visualSeparator ?? `\n${'='.repeat(60)}\n`;
    objectErrorSeparator = objectErrorSeparator ?? `\n${'─'.repeat(60)}\n`;

    return `${visualSeparator}${error.details
      .map((errorDetail) => {
        if (errorDetail.type === 'external') {
          return logHtmlErrors(errorDetail, objectErrorSeparator);
        } else {
          return logSchemaErrors(errorDetail);
        }
      })
      .join(objectErrorSeparator)}${visualSeparator}`;
  },

  // Maps every Joi validation error to a structured { message, isSchemaError }.
  // isSchemaError is true for plain JSON-Schema-expressible constraints (type/required/enum/pattern/min-max),
  // already detected live by Monaco Editor. It's false for errors raised from `.external()` validators
  // (cross-fields business rules, HTML content validation), which Monaco cannot express by construction.
  // All errors are kept and returned — callers decide what to display.
  toStructuredErrors(error) {
    return error.details.map((errorDetail) => {
      if (errorDetail.type !== 'external') {
        return { message: errorDetail.message, isSchemaError: true };
      }

      const isHtmlValidationError = Array.isArray(errorDetail.context?.value?.results);
      if (isHtmlValidationError) {
        return { message: logHtmlErrors(errorDetail, ''), isSchemaError: false };
      }

      return { message: errorDetail.message, isSchemaError: false };
    });
  },
};

function logHtmlErrors(errorDetail, objectErrorSeparator) {
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
  return errorLogs.join(objectErrorSeparator);
}

function logSchemaErrors(errorDetail) {
  const errorLog = [];
  errorLog.push(`\n${errorDetail.message}.`);
  errorLog.push(`Valeur concernée à rechercher : ${JSON.stringify(errorDetail.context.value)}\n`);
  return errorLog.join('\n');
}

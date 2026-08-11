import _ from 'lodash';

export const zodErrorParser = {
  format({ error, data, objectErrorSeparator, visualSeparator }) {
    visualSeparator = visualSeparator ?? `\n${'='.repeat(60)}\n`;
    objectErrorSeparator = objectErrorSeparator ?? `\n${'─'.repeat(60)}\n`;

    return `${visualSeparator}${error.issues
      .map((issue) => {
        if (isHtmlValidationIssue(issue)) {
          return logHtmlErrors(issue, objectErrorSeparator);
        } else {
          return logSchemaErrors(issue, data);
        }
      })
      .join(objectErrorSeparator)}${visualSeparator}`;
  },
};

function isHtmlValidationIssue(issue) {
  return issue.code === 'custom' && issue.message === 'htmlvalidationerror';
}

function logHtmlErrors(issue, objectErrorSeparator) {
  const severity = [
    '',
    'Warning',
    'Error',
  ];
  const report = issue.params.value;
  const errorLogs = [];
  for (const result of report.results) {
    const line = result.source ?? '';
    for (const message of result.messages) {
      const errorLog = [];
      errorLog.push('\n');
      errorLog.push(`Chemin : ${issue.path.join('.')}`);
      errorLog.push(`\n${severity[message.severity]}(${message.ruleId}): ${message.message}`);
      errorLog.push(`${message.ruleUrl}`);
      errorLog.push(`\nValeur concernée à rechercher :\n${line}\n`);
      errorLogs.push(errorLog.join('\n'));
    }
  }
  return errorLogs.join(objectErrorSeparator);
}

function logSchemaErrors(issue, data) {
  const errorLog = [];
  errorLog.push(`\nErreur: ${issue.message}.`);
  const value = data ? _.get(data, issue.path) : undefined;
  errorLog.push(`Valeur concernée à rechercher : ${JSON.stringify(value)}\n`);
  return errorLog.join('\n');
}

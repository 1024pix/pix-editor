export function parseQROCProposal(proposal) {
  const qrocRegex =
    /^\${(?<inputName>[\w-]+?)(#(?<placeholder>[^#]+?))*(§(?<ariaLabel>[^§]+?))*( value="(?<defaultValue>[^"]+?)")*}$/;
  const matches = proposal.match(qrocRegex);

  if (matches === null) {
    throw new TypeError('proposal modifiers should be unique and in the documented order');
  }

  return {
    input: matches.groups.inputName,
    type: 'input',
    placeholder: matches.groups.placeholder ?? '',
    ariaLabel: matches.groups.ariaLabel ?? '',
    defaultValue: matches.groups.defaultValue ?? null,
  };
}

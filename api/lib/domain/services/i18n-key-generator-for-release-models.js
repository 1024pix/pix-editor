module.exports = function generateI18NAttribute(originalAttributeName, {
  frValue,
  enValue,
}) {
  return {
    key: `${originalAttributeName}_i18n`,
    value: {
      fr: frValue,
      en: enValue,
    },
  };
};

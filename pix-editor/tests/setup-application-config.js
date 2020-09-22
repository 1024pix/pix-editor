import ENV from './test-env';

export default function () {
  const appConfig = {
    airtableKey: ENV.AIRTABLE_KEY,
    configKey: ENV.CONFIG_KEY,
    author: 'XXX',
    access: 1,
  };
  localStorage.setItem('pix-config', JSON.stringify(appConfig));
}


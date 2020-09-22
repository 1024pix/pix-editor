export default function () {

  this.namespace = 'api';

  this.get('/areas', ({ areas }) => areas.all());
  this.passthrough('https://api.airtable.com/v0/**');

}


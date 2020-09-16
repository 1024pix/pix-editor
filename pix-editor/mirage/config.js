export default function() {

  this.get('https://api.airtable.com/v0/appHAIFk9u1qqglhX/Domaines', ({ areas }) => areas.all());
  this.passthrough('https://api.airtable.com/v0/**');

}


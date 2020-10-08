import Route from '@ember/routing/route';

export default class EventsLogRoute extends Route {

  model() {
    return this.store.query('note',{
      filterByFormula:'AND({Type d\'élément} = \'acquis\', Changelog = \'oui\')',
      sort: [{ field: 'Date', direction: 'desc' }]
    }).then(notes=>{
      return notes.toArray();
    });
  }
}

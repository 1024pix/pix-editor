import Route from '@ember/routing/route';

export default Route.extend({
  model(){
    return this.get('store').query('note',{
      filterByFormula:'FIND("oui", Production)',
      sort: [{field: 'Date', direction: 'desc'}]
    })
  }
});

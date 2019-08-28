import Route from '@ember/routing/route';

export default Route.extend({
  model(params){
    return this.get('store').query('note',{
      maxRecords: 10,
      sort: [{field: 'Date', direction: 'asc'}]
    })
  }
});

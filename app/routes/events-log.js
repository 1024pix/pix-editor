import Route from '@ember/routing/route';

export default Route.extend({
  model(params){
    return this.get('store').query('note',{
      maxResults:50,
      sort: [{field: 'Date', direction: 'desc'}]
    })
  }
});

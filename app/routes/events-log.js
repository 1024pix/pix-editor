import Route from '@ember/routing/route';

export default Route.extend({
  model(){
    return this.get('store').query('note',{
      sort: [{field: 'Date', direction: 'desc'}]
    })
  }
});

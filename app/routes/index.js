import Route from '@ember/routing/route';

export default Route.extend({
  classNames:['index'],
  redirect(){
    this.transitionTo('events-log')
  }
});

import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('competence', {path:'/competence/:competence_id'}, function() {
    this.route('templates', {path:'/templates'}, function() {
      this.route('new', {path:'/new'});
      this.route('single', {path:'/:template_id'}, function() {
        this.route('alternatives', {path:'/alternatives'}, function() {
          this.route('new', {path:'/new'});
          this.route('single', {path:'/:alternative_id'});
        });
      })
      this.route('list', {path:'/list/:skill_id'});
    });
    this.route('tube', {path:'/tube'}, function() {
      this.route('index', {path:'/:tube_id'});
      this.route('new');
    });
    this.route('skill', {path:'/skill'}, function() {
      this.route('index', {path:'/:skill_id'});
      this.route('new', {path:'/new/:tube_id/:level'});
    });
  });
  this.route('skill', {path:'/skill/:skill_name'});
  this.route('challenge', {path:'/challenge/:challenge_id'});
  this.route('target-profile');
  this.route('events-log');
});

export default Router;

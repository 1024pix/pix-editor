import EmberRouter from '@ember/routing/router';
import config from 'pixeditor/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('competence', { path:'/competence/:competence_id' }, function() {
    this.route('prototypes', function() {
      this.route('new');
      this.route('single', { path:'/:prototype_id' }, function() {
        this.route('alternatives', function() {
          this.route('new');
          this.route('single', { path:'/:alternative_id' });
        });
      });
      this.route('list', { path:'/list/:tube_id/:skill_id' });
    });
    this.route('tubes', function() {
      this.route('single', { path:'/:tube_id' });
      this.route('new');
    });
    this.route('skills', function() {
      this.route('history', { path: '/history/:tube_id/:level' });
      this.route('single', { path:'/:skill_id' }, function() {
        this.route('archive', function() {
          this.route('single', { path:'/:challenge_id' });
        });
      });
      this.route('new', { path:'/new/:tube_id/:level' });
      this.route('list', { path: '/list/:tube_id/:level' });
    });
    this.route('quality', function() {
      this.route('single', { path:'/:skill_id' });
    });
    this.route('i18n', function() {
      this.route('single', { path:'/:skill_id' });
    });
  });
  this.route('skill', { path:'/skill/:skill_name' });
  this.route('challenge', { path:'/challenge/:challenge_id' });
  this.route('target-profile');
  this.route('statistics');
  this.route('events-log');
});

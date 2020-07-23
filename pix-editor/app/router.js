import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('competence', { path:'/competence/:competence_id' }, function() {
    this.route('templates', function() {
      this.route('new');
      this.route('single', { path:'/:template_id' }, function() {
        this.route('alternatives', function() {
          this.route('new');
          this.route('single', { path:'/:alternative_id' });
        });
      });
      this.route('list', { path:'/list/:skill_id' });
    });
    this.route('tubes', function() {
      this.route('single', { path:'/:tube_id' });
      this.route('new');
    });
    this.route('skills', function() {
      this.route('single', { path:'/:skill_id' });
      this.route('new', { path:'/new/:tube_id/:level' });
    });
    this.route('quality', function() {
      this.route('single', { path:'/:skill_id' });
    });
    this.route('history.single', {path: 'history/:tube_id/:level'});
    this.route('i18n', function() {
      this.route('single', { path:'/:skill_id' });
    });
  });
  this.route('skill', { path:'/skill/:skill_name' });
  this.route('challenge', { path:'/challenge/:challenge_id' });
  this.route('target-profile');
  this.route('statistics');
});

import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('competence', {path:'/competence/:competence_id'}, function() {
    this.route('new-template', {path:'/challenge'});
    this.route('challenge', {path:'/challenge/:challenge_id'}, function() {
      this.route('alternatives', {path:'/alternatives'}, function() {
        this.route('alternative', {path:'/:alternative_id'});
        this.route('new-alternative', {path:'/new'});
      });
    });
    this.route('skill', {path:'/skill/:skill_id'});
  });
  this.route('skill', {path:'/skill/:skill_name'});
  this.route('challenge', {path:'/challenge/:challenge_id'});
  this.route('target-profile');
});

export default Router;

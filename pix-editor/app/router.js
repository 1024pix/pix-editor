import EmberRouter from '@ember/routing/router';
import config from 'pixeditor/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('login', { path: 'connexion' });
  this.route('authenticated', { path: '' }, function () {
    this.route('competence', { path: '/competence/:competence_id' }, function () {
      this.route('prototypes', function () {
        this.route('new');
        this.route('single', { path: '/:prototype_id' }, function () {
          this.route('alternatives', function () {
            this.route('new');
            this.route('single', { path: '/:alternative_id' });
          });
        });
        this.route('list', { path: '/list/:tube_id/:skill_id' });
      });
      this.route('tubes', function () {
        this.route('single', { path: '/:tube_id' });
        this.route('new');
      });
      this.route('skills', function () {
        this.route('single', { path: '/:skill_id' }, function () {
          this.route('archive', function () {
            this.route('single', { path: '/:challenge_id' });
          });
        });
        this.route('new', { path: '/new/:tube_id/:level' });
        this.route('list', { path: '/list/:tube_id/:level' });
      });
      this.route('quality', function () {
        this.route('single', { path: '/:skill_id' });
      });
      this.route('i18n', function () {
        this.route('single', { path: '/:skill_id' });
      });

      this.route('themes', function () {
        this.route('single', { path: '/:theme_id' });
        this.route('new');
      });
    });
    this.route('competence-management', function () {
      this.route('new', { path: 'new/:area_id' });
      this.route('single', { path: '/:competence_id' });
    });
    this.route('skill', { path: '/skill/:skill_name' });
    this.route('challenge', { path: '/challenge/:challenge_id' });
    this.route('target-profile');
    this.route('statistics');
    this.route('events-log');
    this.route('area-management', function () {
      this.route('new', { path: 'new/:framework_id' });
    });
    this.route('static-courses', function() {
      this.route('list', { path: '/' });
      this.route('new');
      this.route('static-course', { path: '/:static_course_id' });
    });
  });
});

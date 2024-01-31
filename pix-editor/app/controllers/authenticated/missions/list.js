import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MissionsListController extends Controller {
  @service router;
  queryParams = ['pageNumber', 'pageSize', 'showActiveMissions'];
  @tracked pageNumber = 1;
  @tracked pageSize = 10;
  @tracked showActiveMissions = false;


  @action
  toggleShowActiveMissions() {
    this.showActiveMissions = !this.showActiveMissions;
  }

  @action
  clearFilters() {
    this.showActiveMissions = false;
  }

  @action
  goToMissionDetails(id) {
    this.router.transitionTo('authenticated.missions.mission.details', id);
  }
}

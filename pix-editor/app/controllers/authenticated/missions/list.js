import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import MissionSummary from '../../../models/mission-summary';

export default class MissionsListController extends Controller {
  @service router;
  queryParams = ['pageNumber', 'pageSize', 'statuses'];
  @tracked pageNumber = 1;
  @tracked pageSize = 10;
  @tracked statuses = [];


  @action
  onChangesStatus(arg1) {
    this.statuses = arg1;
  }

  @action
  clearFilters() {
    this.statuses = [];
  }

  @action
  goToMissionDetails(id) {
    this.router.transitionTo('authenticated.missions.mission.details', id);
  }

  get statusesOption() {
    return Object.keys(MissionSummary.statuses).map((status) => {
      return {
        value: MissionSummary.statuses[status],
        label: MissionSummary.displayableStatuses[status],
      };
    });
  }

  get getStatusSelected() {
    return this.statuses;
  }
}

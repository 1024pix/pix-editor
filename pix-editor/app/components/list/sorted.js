import {action} from '@ember/object';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';

export default class SortedList extends Component {

  @tracked ascending = true;
  @tracked sortField = null;
  @tracked sorts = [];

  sortHandlers = {};

  sort(itemA, itemB, sorts, compare, sortEmptyLast) {
    const valuePath = sorts[0].valuePath;
    const isAscending = sorts[0].isAscending;
    const handler = sorts[0].handler;
    let valueA = itemA[valuePath];
    let valueB = itemB[valuePath];
    if (handler) {
      switch (handler.type) {
        case 'array':
          valueA = valueA[0];
          valueB = valueB[0];
          break;
        case 'int':
          valueA = parseInt(valueA);
          valueB = parseInt(valueB);
          break;
        case 'date':
          if (handler.field) {
            valueA = new Date(itemA[handler.field]);
            valueB = new Date(itemB[handler.field]);
          } else {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
          }
          break;
      }
    }
    if (sortEmptyLast) {
      sortEmptyLast = isAscending;
    }
    return isAscending ? compare(valueA, valueB, sortEmptyLast) : -compare(valueA, valueB, sortEmptyLast);
  }

  @action
  sortBy(params) {
    if (params.length > 0) {
      const field = params[0].valuePath;
      this.sortField = field;
      if (this.sortHandlers[field]) {
        params[0].handler = this.sortHandlers[field];
      }
      this.ascending = params[0].isAscending;
      this.sorts = params;
    } else {
      this.ascending = !this.ascending;
      this.sorts = [{
        valuePath:this.sortField,
        isAscending:this.ascending
      }];
    }
  }
}

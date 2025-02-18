import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class WhitelistedUrlList extends Component {
  @tracked searchUrl;
  @tracked searchNames;

  constructor(...args) {
    super(...args);
    this.searchUrl = this.args.urlFilterValue;
    this.searchNames = this.args.namesFilterValue;
  }

  @action
  async updateUrlFilterValue(event) {
    this.searchUrl = event.target.value;
  }

  @action
  async updateNamesFilterValue(event) {
    this.searchNames = event.target.value;
  }

  @action
  async clearFilters() {
    this.searchUrl = null;
    this.searchNames = null;
    await this.args.onClearFiltersClicked();
  }

  @action
  async applyFilters(event) {
    event.preventDefault();
    await this.args.onApplyFiltersClicked(this.searchUrl, this.searchNames);
  }
}

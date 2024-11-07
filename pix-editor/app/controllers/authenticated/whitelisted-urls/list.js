import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class WhitelistedUrlsController extends Controller {
  @service router;
  queryParams = ['url', 'names'];
  @tracked url = '';
  @tracked names = '';

  get filteredWhitelistedUrls() {
    return this.model.whitelistedUrls.filter((whitelistedUrl) => {
      const hasMatchingUrl = whitelistedUrl.url.includes(this.url ?? '');
      let hasMatchingNames = true;
      if (this.names) {
        const urlNames = whitelistedUrl.relatedSkillNames ?? [];
        const searchedNames = this.names.split(',');
        hasMatchingNames = searchedNames.some((name) => urlNames.includes(name));
      }
      return hasMatchingUrl && hasMatchingNames;
    });
  }

  @action
  async applyFilters(urlFilterValue, namesFilterValue) {
    this.url = urlFilterValue ?? '';
    this.names = namesFilterValue ?? '';
  }

  @action
  async clearFilters() {
    this.url = '';
    this.names = '';
  }
}

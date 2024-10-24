import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class WhitelistedUrlsController extends Controller {
  @service router;
  queryParams = ['url', 'ids'];
  @tracked searchUrl = '';
  @tracked searchIds = '';
  @tracked url = '';
  @tracked ids = '';

  formatCreationString = (whitelistedUrl) => {
    const date = new Date(whitelistedUrl.createdAt);
    const DDMMYYYY = this.formatDateToDDMMYYY(date);
    const HHMM = this.formatDateToHHMM(date);
    if (!whitelistedUrl.creatorName) {
      return `Ajoutée le ${DDMMYYYY} à ${HHMM}`;
    }
    return `Ajoutée par ${whitelistedUrl.creatorName} le ${DDMMYYYY} à ${HHMM}`;
  };

  formatUpdateString = (whitelistedUrl) => {
    const date = new Date(whitelistedUrl.updatedAt);
    const DDMMYYYY = this.formatDateToDDMMYYY(date);
    const HHMM = this.formatDateToHHMM(date);
    if (!whitelistedUrl.latestUpdatorName) {
      return `Modifiée le ${DDMMYYYY} à ${HHMM}`;
    }
    return `Modifiée par ${whitelistedUrl.latestUpdatorName} le ${DDMMYYYY} à ${HHMM}`;
  };

  formatDateToDDMMYYY(date) {
    const formater = new Intl.DateTimeFormat('fr');
    return formater.format(date);
  }

  formatDateToHHMM(date) {
    const formater = new Intl.DateTimeFormat('fr', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return formater.format(date);
  }

  @action
  async copyUrl(whitelistedUrl) {
    await navigator.clipboard.writeText(whitelistedUrl.url);
  }

  @action
  async goToEditWhitelistedUrl(whitelistedUrlId, event) {
    event.preventDefault();
    this.router.transitionTo('authenticated.whitelisted-urls.whitelisted-url.edit', whitelistedUrlId);
  }

  @action
  async updateSearchUrl(event) {
    this.searchUrl = event.target.value;
  }

  @action
  async updateSearchIds(event) {
    this.searchIds = event.target.value;
  }

  @action
  clearFilters() {
    this.searchUrl = '';
    this.searchIds = '';
  }

  @action
  async submitFilters(event) {
    event.preventDefault();
    this.url = this.searchUrl;
    this.ids = this.searchIds;
  }
}

import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class WhitelistedUrlsController extends Controller {
  @service router;
  queryParams = ['url', 'names'];
  @tracked searchUrl = '';
  @tracked searchNames = '';
  @tracked url = '';
  @tracked names = '';

  formatCheckType = (checkType) => {
    if (checkType === 'exact_match') {
      return 'Strictement égale à';
    } else {
      return 'Commence par';
    }
  };

  checkTypeColor = (checkType) => {
    if (checkType === 'exact_match') {
      return 'primary';
    } else {
      return 'secondary';
    }
  };

  formatCreationString = (whitelistedUrl) => {
    const date = new Date(whitelistedUrl.createdAt);
    const DDMMYYYY = this.formatDateToDDMMYYY(date);
    const HHMM = this.formatDateToHHMM(date);
    if (!whitelistedUrl.creatorName) {
      return `${DDMMYYYY} à ${HHMM}`;
    }
    return `${DDMMYYYY} à ${HHMM} par ${whitelistedUrl.creatorName} `;
  };

  formatUpdateString = (whitelistedUrl) => {
    const date = new Date(whitelistedUrl.updatedAt);
    const DDMMYYYY = this.formatDateToDDMMYYY(date);
    const HHMM = this.formatDateToHHMM(date);
    if (!whitelistedUrl.latestUpdatorName) {
      return `${DDMMYYYY} à ${HHMM}`;
    }
    return `${DDMMYYYY} à ${HHMM} par ${whitelistedUrl.latestUpdatorName}`;
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
  async updateSearchNames(event) {
    this.searchNames = event.target.value;
  }

  @action
  clearFilters() {
    this.searchUrl = '';
    this.searchNames = '';
  }

  @action
  async submitFilters(event) {
    event.preventDefault();
    this.url = this.searchUrl;
    this.names = this.searchNames;
  }
}

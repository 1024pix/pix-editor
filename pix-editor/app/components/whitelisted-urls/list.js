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

  async copyUrl(whitelistedUrl) {
    await navigator.clipboard.writeText(whitelistedUrl.url);
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

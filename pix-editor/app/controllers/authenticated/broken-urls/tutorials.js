import BrokenUrlsIndexController from './index';

export default class ChallengeBrokenUrlsController extends BrokenUrlsIndexController {
  get filteredBrokenUrls() {
    return this.model.brokenUrls.filter(this.filterBrokenUrls);
  }
}

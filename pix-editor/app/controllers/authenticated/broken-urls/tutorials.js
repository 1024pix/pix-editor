import BrokenUrlsIndexController from './index';

export default class TutorialBrokenUrlsController extends BrokenUrlsIndexController {
  get filteredBrokenUrls() {
    return this.model.brokenUrls.filter(this.filterBrokenUrls);
  }
}

import { tracked } from '@glimmer/tracking';

import BrokenUrlsIndexController from './index';

export default class TutorialBrokenUrlsController extends BrokenUrlsIndexController {
  @tracked tutorialToDelete;
  @tracked skillsUsingTutorialToDelete;

  get filteredBrokenUrls() {
    return this.model.brokenUrls.filter(this.filterBrokenUrls);
  }

  showDeleteTutorialPopIn = async (tutorial, skills) => {
    this.skillsUsingTutorialToDelete = await skills;
    this.tutorialToDelete = tutorial;
  };

  onConfirmDeleteTutorial = async () => {
    this.clearTutorialToDelete();
  };

  clearTutorialToDelete = async () => {
    this.tutorialToDelete = null;
    this.skillsUsingTutorialToDelete = null;
  };
}

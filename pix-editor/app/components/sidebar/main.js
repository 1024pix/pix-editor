import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'pixeditor/config/environment';

export default class SidebarMain extends Component {
  version = ENV.APP.version;
  pix1dFrameworkName = 'Pix 1D';
  @service access;
  @service config;
  @service currentData;

  get author() {
    return this.config.author;
  }

  get areas() {
    return this.currentData.getAreas();
  }

  get mayAccessStaticCourses() {
    return this.access.mayAccessStaticCourses();
  }

  get mayGenerateTargetProfile() {
    return this.access.isReadOnly();
  }

  get maySwitchFramework() {
    return this.access.isReadOnly();
  }

  get maySearch() {
    return this.access.isReadOnly();
  }

  get shouldShowMissionsLink() {
    return this.currentData?.getFramework()?.name.toLowerCase() === this.pix1dFrameworkName.toLowerCase();
  }
}


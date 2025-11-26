import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'pixeditor/config/environment';

import FrameworkModel from '../../models/framework';

export default class SidebarMain extends Component {
  version = ENV.APP.version;
  @service access;
  @service config;
  @service currentData;
  @service versionManager;

  constructor(...args) {
    super(...args);
  }

  get author() {
    return this.config.author;
  }

  get areas() {
    return this.currentData.getAreas();
  }

  get mayAccessStaticCourses() {
    return this.access.mayAccessStaticCourses();
  }

  get mayAccessWhitelistedUrls() {
    return this.access.mayAccessWhitelistedUrls();
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

  get maySynchronizeTranslations() {
    return this.access.isEditor();
  }

  get shouldShowMissionsLink() {
    return this.currentData?.getFramework()?.name.toLowerCase() === FrameworkModel.pix1DFrameworkName.toLowerCase();
  }

  get isV2() {
    return this.versionManager.isV2;
  }

  @action
  switchVersion() {
    this.versionManager.toggleV2();
  }
}

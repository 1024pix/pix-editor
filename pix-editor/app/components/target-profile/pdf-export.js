import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { Canvg, presets } from 'canvg';
import { isEmpty } from 'lodash';
import { service } from '@ember/service';

export default class TargetProfilePdfExportComponent extends Component {
  @service targetProfilesPdfExport;
  @tracked displayTitleInput = false;

  @action
  export() {
    this.displayTitleInput = true;
  }

  @action
  closeTitleInput() {
    this.displayTitleInput = false;
  }

  @action
  async generatePDF(title, language) {
    await this.targetProfilesPdfExport.generatePDF(this.args.model, title, language);
  }
}

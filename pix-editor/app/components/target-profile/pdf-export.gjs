import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import PdfEntries from 'pixeditor/components/pop-in/pdf-entries';

export default class TargetProfilePdfExportComponent extends Component {
  <template>
    <button class="ui button" {{on "click" this.exportPdf}} type="button">
      <i class="pdf file icon"></i>PDF
    </button>
    <PdfEntries
      @validateAction={{this.generatePDF}}
      @close={{this.closeTitleInput}}
      @showModal={{this.displayTitleInput}}
    />
  </template>

  @service targetProfilesPdfExport;
  @tracked displayTitleInput = false;

  @action
  exportPdf() {
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

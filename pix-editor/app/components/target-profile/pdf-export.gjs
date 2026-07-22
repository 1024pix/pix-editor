import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import PdfEntries from 'pixeditor/components/pop-in/pdf-entries';

export default class TargetProfilePdfExportComponent extends Component {
  <template>
    <PixButton @variant="secondary" @size="small" @iconBefore="download" @triggerAction={{this.exportPdf}}>
      PDF
    </PixButton>
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

import Component from '@glimmer/component';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const pixLogo = 'data:image/png;base64,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';
const titleSize = 14;
const titleMargin = 40;
const h1Size = 12;
const h1Padding = 10;
const pSize = 10;
const marginX = 40;
const extraMarginX = 20;
const marginY = 55;
const colors = [[241,161,65],[87,200,132],[18,163,255],[255,63,148],[87,77,166]];

export default class TargetProfilePdfExportComponent extends Component {

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
  generatePDF(title) {
    const pdf = new jsPDF('p', 'pt', 'a4');
    const areas = this.args.model;
    const footerSize = 8;
    let y = marginY+titleMargin;
    const filteredArea = areas.find(area => (area.competences.find(competence=> competence.selectedProductionTubeCount > 0) !== undefined));
    const filter = filteredArea !== undefined;
    const versionText = `Version du ${(new Date()).toLocaleDateString('fr')}`;
    pdf.setFontSize(titleSize);
    pdf.setTextColor('#000000');
    pdf.text(this._getCenteredX(pdf, title), y, title);
    pdf.setFontSize(pSize);
    y += titleMargin;
    areas.forEach((area,index) => {
      const competences = filter ? area.sortedCompetences.filter(competence => competence.selectedProductionTubeCount > 0):area.sortedCompetences;
      competences.forEach(competence => {
        const tubeHead = [ [
          {
            content: `${competence.code} ${competence.title}`,
            colSpan: 2,
            rowSpan:1,
            styles:{
              valign:'middle',
              textColor:[255,255,255],
              fillColor:colors[index],
              fontSize:h1Size,
              cellPadding:{left:extraMarginX, top:h1Padding,right:h1Padding, bottom:h1Padding}
            }
          }
        ]];

        const tubes = filter?competence.productionTubes.filter(tube => tube.selectedLevel):competence.productionTubes;
        const tubeValues = tubes.reduce((values,tube) => {
          values.push([{content:tube.practicalTitle, styles:{cellWidth:200, fontStyle:'bold', fontSize:pSize}},tube.practicalDescription]);
          return values;
        }, []);
        pdf.setTextColor('#000000');
        pdf.setFontSize(pSize);
        pdf.setDrawColor('#000000');
        pdf.autoTable({
          startY:y,
          head:tubeHead,
          body:tubeValues,
          theme:'striped',
          pageBreak: 'avoid',
          rowPageBreak: 'avoid',
          margin:{top:marginY, left:marginX,right:marginX, bottom:marginY}
        });
        y=pdf.autoTable.previous.finalY+marginY;
      });
    });
    const pageCount = pdf.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      pdf.setTextColor('#000000');
      pdf.setFontSize(footerSize);
      pdf.setPage(i);
      pdf.text(marginX,842-30, 'Ceci est un document de travail. Il évolue régulièrement. Sa diffusion est restreinte et son usage limité aux utilisateurs de Pix Orga dans le cadre\nde la mise en œuvre de l\'accompagnement de leurs publics.');
      pdf.text(this._getRightAlignedX(pdf, versionText)-marginX, 35, versionText);
      pdf.addImage(pixLogo, 'PNG', marginX, 15);
    }
    pdf.save(`${title}.pdf`);
  }

  _getCenteredX(pdf, text) {
    var textWidth = pdf.getStringUnitWidth(text) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
    return (pdf.internal.pageSize.width - textWidth) / 2;
  }

  _getRightAlignedX(pdf, text) {
    var textWidth = pdf.getStringUnitWidth(text) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
    return pdf.internal.pageSize.width - textWidth;
  }

}

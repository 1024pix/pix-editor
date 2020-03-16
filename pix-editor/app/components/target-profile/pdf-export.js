import Component from '@glimmer/component';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { action } from '@ember/object';

export default class TargetProfilePdfExportComponent extends Component {
  @action
  exportPdf() {
    const h1Size = 18;
    const h1LineHeight = 20;
    const h1MarginTop = 9;
    const rectHeight = 30;
    const pSize = 12;
    const marginX = 30;
    const extraMarginX = 20;
    const marginY = 60;
    const pdf = new jsPDF('p', 'pt', 'a4');
    const colors = ['#F1A141','#57C884','#12A3FF','#FF3F94','#574DA6'];
    const areas = this.args.model;
    let y = marginY;
    areas.forEach((area,index) => {
      area.competences.filter(competence => competence.selectedProductionTubeCount > 0).forEach(competence => {
        pdf.setFillColor(colors[index]);
        pdf.setDrawColor(0);
        pdf.rect(marginX, y-rectHeight+h1MarginTop, 595 - 2*marginX, rectHeight, "F");
        pdf.setFontSize(h1Size);
        pdf.setTextColor('#FFFFFF');
        pdf.text(marginX+extraMarginX, y, `${competence.code} ${competence.title}`);
        y += h1LineHeight;
        const tubeValues = competence.productionTubes.filter(tube => tube.selectedLevel).reduce((values,tube) => {
          values.push([{content:tube.practicalTitle, styles:{cellWidth:200, fontStyle:'bold'}},tube.practicalDescription]);
          return values;
        }, []);
        pdf.setTextColor('#000000');
        pdf.setFontSize(pSize);
        pdf.setDrawColor('#000000');
        pdf.autoTable({
          startY:y,
          body:tubeValues,
          theme:'striped',
          pageBreak: 'auto',
          rowPageBreak: 'auto'});
        y+=pdf.previousAutoTable.finalY;
      });
    });
    pdf.output("dataurlnewwindow");
  }
}

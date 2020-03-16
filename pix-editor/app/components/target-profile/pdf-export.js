import Component from '@glimmer/component';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { action } from '@ember/object';

export default class TargetProfilePdfExportComponent extends Component {
  @action
  exportPdf() {
    const h1Size = 12;
    const h1Padding = 10;
    const pSize = 10;
    const marginX = 40;
    const extraMarginX = 20;
    const marginY = 40;
    const pdf = new jsPDF('p', 'pt', 'a4');
    const colors = [[241,161,65],[87,200,132],[18,163,255],[255,63,148],[87,77,166]];
    const areas = this.args.model;
    let y = marginY;
    const filteredArea = areas.find(area => (area.competences.find(competence=> competence.selectedProductionTubeCount > 0) !== undefined));
    const filter = filteredArea !== undefined;
    areas.forEach((area,index) => {
      const competences = filter ? area.sortedCompetences.filter(competence => competence.selectedProductionTubeCount > 0):area.sortedCompetences;
      competences.forEach(competence => {
        /*pdf.setFillColor(colors[index]);
        pdf.setDrawColor(0);
        pdf.rect(marginX, y-rectHeight+h1MarginTop, 595 - 2*marginX, rectHeight, "F");
        pdf.setFontSize(h1Size);
        pdf.setTextColor('#FFFFFF');
        pdf.text(marginX+extraMarginX, y, );
        y += h1LineHeight;*/
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
    pdf.output("dataurlnewwindow");
  }
}

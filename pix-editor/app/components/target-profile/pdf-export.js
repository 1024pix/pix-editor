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
    const marginY = 30;
    const pdf = new jsPDF('p', 'pt', 'a4');
    //const colors = ['#F1A141','#57C884','#12A3FF','#FF3F94','#574DA6'];
    const colors = [[241,161,65],[87,200,132],[18,163,255],[255,63,148],[87,77,166]];
    const areas = this.args.model;
    let y = marginY;
    areas.forEach((area,index) => {
      area.competences.filter(competence => competence.selectedProductionTubeCount > 0).forEach(competence => {
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

        const tubeValues = competence.productionTubes.filter(tube => tube.selectedLevel).reduce((values,tube) => {
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

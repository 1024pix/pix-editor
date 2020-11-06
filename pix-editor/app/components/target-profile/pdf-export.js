import Component from '@glimmer/component';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Canvg, { presets } from 'canvg';
import { firstPageBackground, area1bg, area2bg, area3bg, area4bg, area5bg, area6bg, pixLogoWhite } from 'pdf-assets.js';
import 'AmpleSoft-bold.js';
import 'AmpleSoft-normal.js';
import 'Roboto-normal.js';
import 'Roboto-condensed.js';
import 'Roboto-condensedBold.js';
import 'Roboto-condensedLight.js';

const descriptionTitleFirstLine = 'Liste des thèmes et des sujets';
const descriptionTitleSecondtLine = 'abordés dans Pix';
const legalMention = 'Ceci est un document de travail. Il évolue régulièrement. Sa diffusion est restreinte et son usage limité aux utilisateurs de Pix Orga dans le cadre de la mise en oeuvre de l\'accompagnement de leurs publics.';
const firstPageTitleSize = 30;
const firstPagePSize = 12;
const firstPageLegalSize = 9;
const areaTitleSize = 18;
const competenceTitleSize = 14;
const competenceTitleCellPadding = 8;
const pSize = 6;
const footerSize = 4;
const margin = 15;
const areaTitleHeight = 69;
const fontColor = [65, 70, 87];
const lightGrey = [250, 250, 250];
const colors = [[241, 161, 65], [87, 200, 132], [18, 163, 255], [255, 63, 148], [87, 77, 166], [56, 138, 255]];
const areaGradient = [area1bg, area2bg, area3bg, area4bg, area5bg, area6bg];

function createOffscreenCanvas(width, height) {
  let canvas;
  if (window.OffscreenCanvas) {
    canvas = new OffscreenCanvas(width, height);
  } else {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas['convertToBlob'] = async () => {
      return new Promise(resolve => {
        canvas.toBlob(resolve);
      });
    };
  }
  return canvas;
}

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
  async generatePDF(title) {
    let y;
    const areas = this.args.model;
    const versionText = `Version du ${(new Date()).toLocaleDateString('fr')}`;
    const pdf = new jsPDF('p', 'px', 'a4');
    const pdfWidth = pdf.internal.pageSize.width;
    const pdfHeight = pdf.internal.pageSize.height;
    const pageWidth = pdfWidth - margin * 2;
    const canvas = createOffscreenCanvas(pdfWidth, pdfHeight);
    const ctx = canvas.getContext('2d');

    const filteredArea = areas.find(area => (area.competences.find(competence => competence.selectedProductionTubeCount > 0) !== undefined));
    const filter = filteredArea !== undefined;
    const v = await Canvg.fromString(ctx, firstPageBackground, presets.offscreen());
    await v.render();
    const blob = await canvas.convertToBlob();
    const pngUrl = URL.createObjectURL(blob);
    pdf.addImage(
      pngUrl,
      'PNG',
      margin / 2,
      margin / 2,
      pdfWidth - margin,
      pdfHeight - margin
    );
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(margin);
    pdf.roundedRect(margin / 2, margin / 2, pdfWidth - margin, pdfHeight - margin, 15, 15, 'S');
    pdf.addImage(pixLogoWhite, 'PNG', (pdfWidth - 140) / 2, 120, 140, 105.7);
    pdf.setFont('AmpleSoft', 'bold');
    pdf.setFontSize(firstPageTitleSize);
    pdf.setTextColor('#fff');
    pdf.text(descriptionTitleFirstLine, this._getCenteredX(pdf, descriptionTitleFirstLine), 300);
    pdf.text(descriptionTitleSecondtLine, this._getCenteredX(pdf, descriptionTitleSecondtLine), 335);
    pdf.setFontSize(firstPagePSize);
    pdf.setFont('AmpleSoft', 'normal');
    pdf.text(versionText, this._getCenteredX(pdf, versionText), 560);
    pdf.setFontSize(firstPageLegalSize);
    pdf.setFont('Roboto', 'normal');
    pdf.text(legalMention, 68, 580, { maxWidth: 310, align: 'justify' });
    pdf.addPage();


    for (let i = 0; i < areas.length; i++) {
      const area = areas[i];
      const competences = filter ? area.sortedCompetences.filter(competence => competence.selectedProductionTubeCount > 0) : area.sortedCompetences;
      y = areaTitleHeight;

      if (competences.length !== 0) {

        const areaName = area.name.slice(3, area.name.length);
        await this._buildRoundedGradientBackground(pdf, areaGradient[i], 0, 0, pdfWidth, 34);
        pdf.setFont('AmpleSoft', 'normal');
        pdf.setFontSize(areaTitleSize);
        pdf.setTextColor('#fff');
        pdf.text(this._getCenteredX(pdf, areaName.toUpperCase()), areaTitleHeight / 2 + 4, areaName.toUpperCase());

        competences.forEach(competence => {
          const tubeHead = [[
            {
              content: competence.title,
              colSpan: 3,
              rowSpan: 1,
              styles: {
                cellPadding: {
                  left: margin,
                  top: competenceTitleCellPadding,
                  right: margin,
                  bottom: competenceTitleCellPadding
                },
                fillColor: lightGrey,
                font: 'RobotoCondensed',
                fontStyle: 'bold',
                fontSize: competenceTitleSize,
                textColor: fontColor,
                valign: 'middle'
              }
            }
          ]];

          const tubes = filter ? competence.productionTubes.filter(tube => tube.selectedLevel) : competence.productionTubes;
          const tubeValues = tubes.reduce((values, tube, i) => {
            const cells = [
              {
                content: tube.practicalTitleFr,
                styles: {
                  cellPadding: { top: 3, right: 5, bottom: 0, left: 5 },
                  cellWidth: 100,
                  font: 'RobotoCondensed',
                  fontStyle: 'normal',
                  fontSize: pSize,
                  textColor: fontColor
                }
              },
              {
                content: tube.practicalDescriptionFr,
                styles: {
                  cellPadding: { top: 3, right: 5, bottom: 0, left: 5 },
                  fontSize: pSize,
                  font: 'RobotoCondensed',
                  fontStyle: 'light',
                  textColor: fontColor
                }
              }];

            if (i === 0) {
              cells.forEach((value) => value.styles.cellPadding.top = margin / 2);
            }

            values.push(cells);
            return values;
          }, []);
          //todo add theme
          if (tubeValues && tubeValues[0]) {
            tubeValues[0].unshift({
              content: '',
              rowSpan: tubeValues.length,
              styles: {
                cellPadding: { top: 0, right: 0, bottom: 0, left: margin },
                cellWidth: 100,
                valign: 'middle',
                font: 'RobotoCondensed',
                fontStyle: 'bold',
                fontSize: pSize + 4,
                textColor: fontColor
              }
            });
          }

          pdf.autoTable({
            startY: y,
            head: tubeHead,
            body: tubeValues,
            styles: { fillColor: lightGrey },
            theme: 'plain',
            pageBreak: 'avoid',
            rowPageBreak: 'avoid',
            margin: { top: margin, left: margin, right: margin, bottom: 0 },
          });

          const newY = pdf.autoTable.previous.finalY;

          // Test if is a page break
          if (newY < y) {
            y = margin;
          }

          // Draw rounded corner
          pdf.setFillColor(...colors[i]);
          pdf.roundedRect(margin, y - 5, pageWidth, 10, 5, 5, 'F');
          pdf.setFillColor(...lightGrey);
          pdf.roundedRect(margin, newY - 5, pageWidth, 10, 5, 5, 'F');

          // Reprint table to prevent text hide by roundedRect
          pdf.autoTable({
            startY: y,
            head: tubeHead,
            body: tubeValues,
            styles: { fillColor: lightGrey },
            theme: 'plain',
            pageBreak: 'avoid',
            rowPageBreak: 'avoid',
            margin: { top: margin, left: margin, right: margin, bottom: 0 },
          });

          // Draw separation between header and body
          const positionHead = pdf.autoTable.previous.head[0].height;
          pdf.setDrawColor(255, 255, 255);
          pdf.setLineWidth(2);
          pdf.line(0, y + positionHead, pdfWidth, y + positionHead);
          y = 15 + pdf.autoTable.previous.finalY;
        });
        pdf.addPage();
      }

    }
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 2; i <= pageCount; i++) {
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(footerSize);
      pdf.setFont('Roboto', 'normal');
      pdf.setPage(i);
      pdf.text(margin, pdfHeight - 10, `${legalMention} - ${versionText}`);
    }

    // Remove last empty page
    pdf.deletePage(pageCount);
    pdf.save(`${title}.pdf`);
  }

  _getCenteredX(pdf, text) {
    const textWidth = pdf.getStringUnitWidth(text) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
    return (pdf.internal.pageSize.width - textWidth) / 2;
  }

  async _buildRoundedGradientBackground(pdf, svg, x, y, width, height) {
    const canvas = createOffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const strokeWidth = 15;
    const radius = 15;
    const v = await Canvg.fromString(ctx, svg, presets.offscreen());
    await v.render();
    const blob = await canvas.convertToBlob();
    const pngUrl = URL.createObjectURL(blob);
    pdf.addImage(pngUrl, 'PNG', x - strokeWidth / 2, y + strokeWidth / 2, width + strokeWidth, height + strokeWidth);
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(strokeWidth);
    pdf.roundedRect(x + strokeWidth / 2, y + strokeWidth / 2, width - strokeWidth, height + strokeWidth, radius, radius, 'S');
  }
}

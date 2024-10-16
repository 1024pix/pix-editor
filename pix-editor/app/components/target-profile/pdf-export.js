import 'jspdf-autotable';
import '../../vendor/AmpleSoft-bold.js';
import '../../vendor/AmpleSoft-normal.js';
import '../../vendor/Roboto-normal.js';
import '../../vendor/Roboto-condensed.js';
import '../../vendor/Roboto-condensedBold.js';
import '../../vendor/Roboto-condensedLight.js';

import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { Canvg, presets } from 'canvg';
import jsPDF from 'jspdf';
import { isEmpty } from 'lodash';

import {
  area1bg,
  area2bg,
  area3bg,
  area4bg,
  area5bg,
  area6bg,
  firstPageBackground,
  pixLogoWhite,
} from '../../vendor/pdf-assets.js';

const legalMentionByLanguage = {
  en: 'This is a working document, updated regularly. Its distribution is restricted and its use limited to Pix Orga members in the context of the implementation of the support of their users.',
  fr: 'Ceci est un document de travail. Il évolue régulièrement. Sa diffusion est restreinte et son usage limité aux utilisateurs de Pix Orga dans le cadre de la mise en oeuvre de l\'accompagnement de leurs publics.',
};
const firstPageTitleSize = 30;
const firstPagePSize = 20;
const firstPageLegalSize = 10.5;
const areaTitleSize = 18;
const competenceTitleSize = 12;
const competenceTitleCellPadding = 3;
const pSize = 7.4;
const footerSize = 4;
const margin = 15;
const areaTitleHeight = 69;
const fontColor = [65, 70, 87];
const lightGrey = [250, 250, 250];
const grey = [240, 240, 240];
const colors = [[241, 161, 65], [87, 200, 132], [18, 163, 255], [255, 63, 148], [87, 77, 166], [56, 138, 255]];
const areaGradient = [area1bg, area2bg, area3bg, area4bg, area5bg, area6bg];

const defaultLanguage = 'fr';

function createOffscreenCanvas(width, height) {
  let canvas;
  if (window.OffscreenCanvas) {
    canvas = new OffscreenCanvas(width, height);
  } else {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas['convertToBlob'] = async () => {
      return new Promise((resolve) => {
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
  async generatePDF(title, language) {
    let y;
    const areas = this.args.model;
    const legalMention = legalMentionByLanguage[language];
    const pdfName = this._generatePdfName(title);
    const versionText = this._getVersionText(language);

    const pdf = new jsPDF('p', 'px', 'a4');
    const pdfWidth = pdf.internal.pageSize.width;
    const pdfHeight = pdf.internal.pageSize.height;
    const pageWidth = pdfWidth - margin * 2;
    const canvas = createOffscreenCanvas(pdfWidth, pdfHeight);
    const ctx = canvas.getContext('2d');

    const hasSelectedTubes = areas.some((area) => {
      return area.competencesArray.some((competence) => competence.selectedProductionTubeCount > 0);
    });
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
      pdfHeight - margin,
    );
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(margin);
    pdf.roundedRect(margin / 2, margin / 2, pdfWidth - margin, pdfHeight - margin, 15, 15, 'S');
    pdf.addImage(pixLogoWhite, 'PNG', (pdfWidth - 140) / 2, 120, 140, 105.7);
    pdf.setFont('AmpleSoft', 'bold');
    pdf.setFontSize(firstPageTitleSize);
    pdf.setTextColor('#fff');
    this._generateCenteredLongText(pdf, title, 350, 35, 300);
    pdf.setFontSize(firstPagePSize);
    pdf.setFont('AmpleSoft', 'bold');
    pdf.text(versionText, this._getCenteredX(pdf, versionText), 530);
    pdf.setFontSize(firstPageLegalSize);
    pdf.setFont('Roboto', 'normal');
    pdf.text(legalMention, 44, 580, { maxWidth: 360, align: 'justify' });
    pdf.addPage();

    for (let i = 0; i < areas.length; i++) {
      const area = areas[i];
      const competences = hasSelectedTubes ? area.sortedCompetences.filter((competence) => competence.selectedProductionTubeCount > 0) : area.sortedCompetences;
      y = areaTitleHeight / 2 + 10;

      if (competences.length !== 0) {
        const areaName = this._getTranslatedAreaName(language, area);
        await this._buildRoundedGradientBackground(pdf, areaGradient[i], -15, -30, pdfWidth + 30, 49);
        pdf.setFont('AmpleSoft', 'bold');
        pdf.setFontSize(areaTitleSize);
        pdf.setTextColor('#fff');
        pdf.text(this._getCenteredX(pdf, areaName), (areaTitleHeight / 2) - 10, areaName);

        competences.forEach((competence) => {
          const competenceColor = colors[i];
          const competenceName = this._getTranslatedCompetenceName(language, competence);
          const tableHead = [[
            {
              content: `${competence.code} ${competenceName}`,
              colSpan: 3,
              rowSpan: 1,
              styles: {
                cellPadding: {
                  left: margin,
                  top: competenceTitleCellPadding,
                  right: margin,
                  bottom: competenceTitleCellPadding,
                },
                fillColor: lightGrey,
                font: 'RobotoCondensed',
                fontStyle: 'bold',
                fontSize: competenceTitleSize,
                textColor: competenceColor,
                valign: 'middle',
              },
            },
          ]];

          const themes = hasSelectedTubes ? competence.sortedThemes.filter((theme) => theme.hasSelectedProductionTube) : competence.sortedThemes.filter((theme) => theme.hasProductionTubes);

          const tableBody = themes.reduce((values, theme) => {
            const tubes = hasSelectedTubes ? theme.productionTubes.filter((tube) => tube.selectedLevel) : theme.productionTubes;
            const buildCell = this._buildCell(theme, tubes, language);
            return [...values, ...buildCell];
          }, []);

          pdf.autoTable({
            startY: y,
            head: tableHead,
            body: tableBody,
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
          pdf.setFillColor(...lightGrey);
          pdf.roundedRect(margin, y - 5, pageWidth, 10, 5, 5, 'F');
          pdf.setFillColor(...lightGrey);
          pdf.roundedRect(margin, newY - 5, pageWidth, 10, 5, 5, 'F');

          // Reprint table to prevent text hide by roundedRect
          pdf.autoTable({
            startY: y,
            head: tableHead,
            body: tableBody,
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

          // Draw separation between theme
          let indexCell = 0;
          themes.forEach((theme) => {
            const tubes = hasSelectedTubes ? theme.productionTubes.filter((tube) => tube.selectedLevel) : theme.productionTubes;
            indexCell += tubes.length;
            const positionCell = pdf.autoTable.previous.body[indexCell]?.cells[0];
            if (positionCell) {
              pdf.setDrawColor(255, 255, 255);
              pdf.setLineWidth(1);
              pdf.line(positionCell.x, positionCell.y + 2.5, pdfWidth - positionCell.x, positionCell.y + 2.5);
            }
          });
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
      pdf.text(margin, pdfHeight - 4, `${legalMention} - ${versionText}`);
    }

    // Remove last empty page
    pdf.deletePage(pageCount);
    pdf.save(`${pdfName}.pdf`);
  }

  _buildCell(theme, tubes, language) {
    const rowSpan = tubes.length;
    const cellPaddingTop = 5;
    const firstTube = tubes.shift();
    const { tubeName, tubeDescription } = this._getTranslatedTubeNameAndDescription(language, firstTube);
    const themeName = this._getTranslatedThemeName(language, theme);
    const firstCell = [{
      content: themeName,
      rowSpan,
      styles: {
        cellPadding: { top: cellPaddingTop, right: 5, bottom: 1, left: margin },
        cellWidth: 80,
        valign: 'middle',
        font: 'RobotoCondensed',
        fontStyle: 'bold',
        fontSize: pSize + 1,
        textColor: fontColor,
        fillColor: lightGrey,
      },
    }, {
      content: tubeName,
      styles: {
        cellPadding: { top: cellPaddingTop, right: 5, bottom: 1, left: 1 },
        cellWidth: 100,
        valign: 'middle',
        font: 'RobotoCondensed',
        fontStyle: 'normal',
        fontSize: pSize,
        textColor: fontColor,
        fillColor: lightGrey,
      },
    }, {
      content: tubeDescription,
      styles: {
        cellPadding: { top: cellPaddingTop, right: 5, bottom: 1, left: 1 },
        fontSize: pSize,
        valign: 'middle',
        font: 'RobotoCondensed',
        fontStyle: 'light',
        textColor: fontColor,
        fillColor: lightGrey,
      },
    }];
    return tubes.reduce((values, tube, index) => {
      const fillColor = index % 2 === 0 ? grey : lightGrey;
      const { tubeName, tubeDescription } = this._getTranslatedTubeNameAndDescription(language, tube);
      const cells = [
        {
          content: tubeName,
          styles: {
            cellPadding: { top: 1, right: 5, bottom: 1, left: 1 },
            cellWidth: 100,
            valign: 'middle',
            font: 'RobotoCondensed',
            fontStyle: 'normal',
            fontSize: pSize,
            textColor: fontColor,
            fillColor,
          },
        },
        {
          content: tubeDescription,
          styles: {
            cellPadding: { top: 1, right: 5, bottom: 1, left: 1 },
            fontSize: pSize,
            valign: 'middle',
            font: 'RobotoCondensed',
            fontStyle: 'light',
            textColor: fontColor,
            fillColor,
          },
        }];
      values.push(cells);
      return values;
    }, [firstCell]);
  }

  _getVersionText(language) {
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const versionTextByLanguage = {
      en: `Version ${(new Date()).toLocaleDateString('en', dateOptions)}`,
      fr: `Version du ${(new Date()).toLocaleDateString('fr', dateOptions)}`,
    };
    return versionTextByLanguage[language];
  }

  _getTranslatedAreaName(language, area) {
    const areaNameKeys = {
      en: 'titleEnUs',
      fr: 'titleFrFr',
    };
    return this._getTranslatedField(areaNameKeys, language, area);
  }

  _getTranslatedCompetenceName(language, competence) {
    const competenceNameKeys = {
      en: 'titleEn',
      fr: 'title',
    };
    return this._getTranslatedField(competenceNameKeys, language, competence);
  }

  _getTranslatedThemeName(language, theme) {
    const themeNameKeys = {
      en: 'nameEnUs',
      fr: 'name',
    };
    return this._getTranslatedField(themeNameKeys, language, theme);
  }

  _getTranslatedTubeNameAndDescription(language, tube) {
    const tubeNameKeys = {
      en: 'practicalTitleEn',
      fr: 'practicalTitleFr',
    };
    const tubeDescriptionKeys = {
      en: 'practicalDescriptionEn',
      fr: 'practicalDescriptionFr',
    };
    const tubeName = this._getTranslatedField(tubeNameKeys, language, tube);
    const tubeDescription = this._getTranslatedField(tubeDescriptionKeys, language, tube);
    return { tubeName, tubeDescription };
  }

  _getTranslatedField(keys, language, model) {
    const translatedField = model[keys[language]];
    return isEmpty(translatedField?.trim()) ? `${model[keys[defaultLanguage]]} [English version coming soon]` : translatedField;
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

  _generatePdfName(title) {
    const id = `${Date.now()}`.slice(5, 9);
    const generateDate = `${(new Date()).toLocaleDateString('fr')}_${id}`;
    return `${title}-${generateDate}`;
  }

  _generateCenteredLongText(pdf, text, breakX, breakY, positionY) {
    const lines = pdf.splitTextToSize(text, breakX);
    lines.forEach((line)=>{
      pdf.text(line, this._getCenteredX(pdf, line), positionY);
      positionY += breakY;
    });
  }
}

import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class CompetenceCompetenceGridComponent extends Component {
  @service config;

  constructor(...args) {
    super(...args);

    if (this.config.author !== 'BBR') return;
    this.guirlandeIntervalId = setInterval(() => this.guirlandeDeBenjix(), 2_000);
  }

  cestPlusNoel() {
    const emptyCells = document.querySelectorAll('.skill-cell__empty');
    emptyCells.forEach((cell) => {
      cell.style.background = 'transparent';
      cell.style.color = 'black';
      cell.textContent = '';
    });
  }

  randomIntBetween(a, b) {
    return Math.floor(Math.random() * (b - a) + a);
  }

  guirlandeDeBenjix() {
    const emptyCells = document.querySelectorAll('.skill-cell__empty');
    const cellWithTextIndex = this.randomIntBetween(0, emptyCells.length);
    emptyCells.forEach((cell, i) => {
      cell.style.background = ['#f00', '#060'][this.randomIntBetween(0, 2)];
      if (i === cellWithTextIndex) {
        cell.style.fontWeight = 'bold';
        cell.style.position = 'relative';
        cell.innerHTML = '<p style="position: absolute; top: 8px; left: 14px;">c\'est relou hein</p>';
        cell.style.fontSize = '1rem';
        cell.style.color = '#fff';
      }
    });
    setTimeout(() => this.cestPlusNoel(), 1_000);
  }

  get isOverview() {
    return this.args.competenceOverview != null;
  }

  get thematicOverviewsOrThematics() {
    if (this.isOverview) {
      return this.args.competenceOverview.thematicOverviews.map((thematicOverview) => ({
        thematicOverview,
      }));
    }
    return this.args.competence.sortedThemes.map((thematic) => ({ thematic }));
  }

  willDestroy(...args) {
    super.willDestroy(...args);
    if (this.guirlandeIntervalId) clearInterval(this.guirlandeIntervalId);
  }
}

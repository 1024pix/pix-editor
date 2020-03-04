import Controller from '@ember/controller';
import {action} from '@ember/object';
import {inject as service} from '@ember/service';
import {alias} from '@ember/object/computed';
import {inject as controller} from '@ember/controller';
import {scheduleOnce} from '@ember/runloop';
import {tracked} from '@glimmer/tracking';

export default class SingleController extends Controller {

  wasMaximized = false;

  @tracked edition = false;
  @tracked displaySelectLocation = false;

  @controller('competence')
  parentController;

  @alias('parentController.firstMaximized')
  maximized;

  @alias('model')
  skill;

  @controller application;

  @service config;
  @service access;

  get skillName() {
    return `${this.skill.pixId} (${this.skill.name})`;
  }

  get mayEdit() {
    return this.access.mayEditSkills();
  }

  get mayAccessAirtable() {
    return this.access.mayAccessAirtable();
  }

  get mayMove() {
    return this.access.mayMoveSkill(this.skill);
  }

  _scrollToTop() {
    document.querySelector('.skill-data').scrollTop = 0;
  }

  @action
  previewTemplate() {
    const template = this.skill.productionTemplate;
    window.open(template.preview, template.id);
  }

  @action
  openAirtable() {
    window.open(this.config.airtableUrl + this.config.tableSkills + '/' + this.skill.id, 'airtable');
  }

  @action
  maximize() {
    this.maximized = true;
  }

  @action
  minimize() {
    this.maximized = false;
  }

  @action
  close() {
    this.maximized = false;
    this.transitionToRoute('competence.skills', this.competence);
  }

  @action
  edit() {
    this.wasMaximized = this.maximized;
    this.maximize();
    this.edition = true;
    scheduleOnce('afterRender', this, this._scrollToTop);
  }

  @action
  cancelEdit() {
    this.edition = false;
    let skill = this.skill;
    skill.rollbackAttributes();
    const challenge = this.skill.productionTemplate;
    if (challenge) {
      challenge.rollbackAttributes();
    }
    let previousState = this.wasMaximized;
    if (!previousState) {
      this.minimize();
    }
    this.application.send('showMessage', 'Modification annulée', true);
  }

  @action
  save() {
    this.application.send('isLoading');
    let skill = this.skill;
    const template = this.skill.productionTemplate;
    let operation;
    if (template) {
      operation = template.save();
    } else {
      operation = Promise.resolve();
    }
    return operation.then(()=>{
      return skill.save();
    })
    .then(() => {
      this.edition = false;
      this.application.send('finishedLoading');
      this.application.send('showMessage', 'Acquis mis à jour', true);
    })
    .catch((error) => {
      console.error(error);
      this.application.send('finishedLoading');
      this.application.send('showMessage', 'Erreur lors de la mise à jour de l\'acquis', true);
    });
  }

  @action
  moveSkill() {
   this.displaySelectLocation = true;
  }

  @action
  setLocation(competence, newTube, level) {
    let skill = this.skill;
    this.application.send('isLoading');
    skill.tube = newTube;
    skill.level = level;
    skill.competence = [competence.get('id')];
    return skill.save()
      .then(() => {
        this.application.send('finishedLoading');
        this.application.send('showMessage', 'Acquis mis à jour', true);
        this.transitionToRoute('competence.skills.single', competence, skill);
      })
      .catch((error) => {
        console.error(error);
        this.application.send('finishedLoading');
        this.application.send('showMessage', 'Erreur lors de la mise à jour de l\'acquis', true);
      });
  }

  @action
  closeSelectLocation() {
    this.displaySelectLocation = false;
  }
}

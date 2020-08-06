import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { inject as controller } from '@ember/controller';
import { scheduleOnce } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

export default class SingleController extends Controller {

  wasMaximized = false;

  @tracked edition = false;
  @tracked displaySelectLocation = false;

  @controller('competence')
  parentController;

  @alias('parentController.leftMaximized')
  maximized;

  @alias('model')
  skill;

  @service config;
  @service access;
  @service notify;
  @service loader;
  @service confirm;

  get skillName() {
    return `${this.skill.pixId} (${this.skill.name})`;
  }

  get mayEdit() {
    return this.access.mayEditSkill(this.skill);
  }

  get mayAccessAirtable() {
    return this.access.mayAccessAirtable();
  }

  get mayMove() {
    return this.access.mayMoveSkill(this.skill);
  }

  get mayArchive() {
    return this.access.mayArchiveSkill(this.skill);
  }

  get mayDelete() {
    return this.access.mayDeleteSkill(this.skill);
  }

  _scrollToTop() {
    document.querySelector('.skill-data').scrollTop = 0;
  }

  @action
  previewPrototype() {
    const prototype = this.skill.productionPrototype;
    window.open(prototype.preview, prototype.id);
  }

  @action
  openAirtable() {
    window.open(this.config.airtableUrl + this.config.tableSkills + '/' + this.skill.id, 'airtable');
  }

  @action
  maximize() {
    this.parentController.maximizeLeft(true);
  }

  @action
  minimize() {
    this.parentController.maximizeLeft(false);
  }

  @action
  close() {
    this.parentController.send('closeChildComponent');
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
    const skill = this.skill;
    skill.rollbackAttributes();
    const challenge = this.skill.productionPrototype;
    if (challenge) {
      challenge.rollbackAttributes();
    }
    if (!this.wasMaximized) {
      this.minimize();
    }
    this.notify.message('Modification annulée');
  }

  @action
  save() {
    this.loader.start();
    const skill = this.skill;
    const prototype = this.skill.productionPrototype;
    let operation;
    if (prototype) {
      operation = prototype.save();
    } else {
      operation = Promise.resolve();
    }
    return operation.then(()=>{
      return skill.save();
    })
      .then(() => {
        this.edition = false;
        this.loader.stop();
        this.notify.message('Acquis mis à jour');
      })
      .catch((error) => {
        console.error(error);
        this.loader.stop();
        this.notify.error('Erreur lors de la mise à jour de l\'acquis');
      });
  }

  @action
  moveSkill() {
    this.displaySelectLocation = true;
  }

  @action
  setLocation(competence, newTube, level) {
    const skill = this.skill;
    this.loader.start();
    skill.tube = newTube;
    skill.level = level;
    skill.competence = [competence.get('id')];
    return skill.save()
      .then(() => {
        this.loader.stop();
        this.notify.message('Acquis mis à jour');
        this.transitionToRoute('competence.skills.single', competence, skill);
      })
      .catch((error) => {
        console.error(error);
        this.loader.stop();
        this.notify.error('Erreur lors de la mise à jour de l\'acquis');
      });
  }

  @action
  closeSelectLocation() {
    this.displaySelectLocation = false;
  }

  @action
  archiveSkill() {
    if (this.skill.productionPrototype) {
      this.notify.error('Vous ne pouvez pas archiver un acquis avec des épreuves publiées');
      return;
    }
    const challenges = this.skill.challenges;
    return this.confirm.ask('Archivage', 'Êtes-vous sûr de vouloir archiver l\'acquis ?')
      .then(() => {
        this.loader.start('Archivage de l\'acquis');
        return this.skill.archive()
          .then(() => {
            this.close();
            this.notify.message('Acquis archivé');
          })
          .then(() => {
            const updateChallenges = challenges.filter(challenge => !challenge.isArchived).map(challenge => {
              return challenge.archive()
                .then(() => {
                  if (challenge.isPrototype) {
                    this.notify.message('Prototype archivé');
                  } else {
                    this.notify.message(`Déclinaison n°${challenge.alternativeVersion} archivée`);
                  }
                });
            });
            return Promise.all(updateChallenges);
          })
          .catch(error =>{
            console.error(error);
            this.notify.error('Erreur lors de l\'archivage de l\'acquis');
          })
          .finally(() => {
            this.loader.stop();
          });
      })
      .catch(() => this.notify.message('Archivage abandonné'));
  }

  @action
  deleteSkill() {
    if (this.skill.productioPrototype) {
      this.notify.error('Vous ne pouvez pas Supprimer un acquis avec des épreuves publiées');
      return;
    }
    const challenges = this.skill.challenges;
    return this.confirm.ask('Suppression', 'Êtes-vous sûr de vouloir supprimer l\'acquis ?')
      .then(() => {
        this.loader.start('Suppression de l\'acquis');
        return this.skill.delete()
          .then(() => {
            this.close();
            this.notify.message('Acquis supprimé');
          })
          .then(() => {
            const updateChallenges = challenges.filter(challenge => !challenge.isDeleted).map(challenge => {
              return challenge.delete()
                .then(() => {
                  if (challenge.isPrototype) {
                    this.notify.message('Prototype Supprimé');
                  } else {
                    this.notify.message(`Déclinaison n°${challenge.alternativeVersion} Supprimée`);
                  }
                });
            });
            return Promise.all(updateChallenges);
          })
          .catch(error =>{
            console.error(error);
            this.notify.error('Erreur lors de la suppression de l\'acquis');
          })
          .finally(() => {
            this.loader.stop();
          });
      })
      .catch(() => this.notify.message('Suppression abandonnée'));
  }
}
